package com.bookstore.config;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
@Profile("render")
public class RenderPostgresConfig {

    private static final String JDBC_PREFIX = "jdbc:postgresql://";

    @Bean
    @Primary
    public DataSource renderDataSource(Environment environment) {
        RenderDatabaseSettings settings = resolveSettings(environment);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setJdbcUrl(settings.jdbcUrl());
        if (StringUtils.hasText(settings.username())) {
            dataSource.setUsername(settings.username());
        }
        if (StringUtils.hasText(settings.password())) {
            dataSource.setPassword(settings.password());
        }
        return dataSource;
    }

    private RenderDatabaseSettings resolveSettings(Environment environment) {
        String rawUrl = firstNonBlank(environment, "SPRING_DATASOURCE_URL", "DATABASE_URL");
        if (!StringUtils.hasText(rawUrl)) {
            throw new IllegalStateException(
                    "Render profile requires SPRING_DATASOURCE_URL or DATABASE_URL to be configured.");
        }

        String username = firstNonBlank(environment, "SPRING_DATASOURCE_USERNAME", "DATABASE_USERNAME");
        String password = firstNonBlank(environment, "SPRING_DATASOURCE_PASSWORD", "DATABASE_PASSWORD");

        if (rawUrl.startsWith("jdbc:")) {
            return new RenderDatabaseSettings(rawUrl, username, password);
        }

        return fromDatabaseUrl(rawUrl, username, password);
    }

    private RenderDatabaseSettings fromDatabaseUrl(String rawUrl, String username, String password) {
        try {
            URI databaseUri = new URI(rawUrl);
            String scheme = databaseUri.getScheme();
            if (!"postgres".equalsIgnoreCase(scheme) && !"postgresql".equalsIgnoreCase(scheme)) {
                throw new IllegalStateException("Unsupported Render database URL scheme: " + scheme);
            }

            String jdbcUrl = buildJdbcUrl(databaseUri);
            String resolvedUsername = username;
            String resolvedPassword = password;

            if ((!StringUtils.hasText(resolvedUsername) || !StringUtils.hasText(resolvedPassword))
                    && StringUtils.hasText(databaseUri.getUserInfo())) {
                String[] userInfoParts = databaseUri.getUserInfo().split(":", 2);
                if (!StringUtils.hasText(resolvedUsername) && userInfoParts.length > 0) {
                    resolvedUsername = userInfoParts[0];
                }
                if (!StringUtils.hasText(resolvedPassword) && userInfoParts.length > 1) {
                    resolvedPassword = userInfoParts[1];
                }
            }

            return new RenderDatabaseSettings(jdbcUrl, requireValue(resolvedUsername, "database username"),
                    requireValue(resolvedPassword, "database password"));
        } catch (URISyntaxException exception) {
            throw new IllegalStateException("Invalid Render DATABASE_URL value.", exception);
        }
    }

    private String buildJdbcUrl(URI databaseUri) {
        String host = requireValue(databaseUri.getHost(), "database host");
        int port = databaseUri.getPort() > 0 ? databaseUri.getPort() : 5432;
        String path = requireValue(databaseUri.getPath(), "database name");

        StringBuilder jdbcUrl = new StringBuilder(JDBC_PREFIX)
                .append(host)
                .append(":")
                .append(port)
                .append(path);

        if (StringUtils.hasText(databaseUri.getQuery())) {
            jdbcUrl.append("?").append(databaseUri.getQuery());
        }

        return jdbcUrl.toString();
    }

    private String firstNonBlank(Environment environment, String... propertyNames) {
        for (String propertyName : propertyNames) {
            String value = environment.getProperty(propertyName);
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private String requireValue(String value, String label) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException("Render profile requires a " + label + ".");
        }
        return value;
    }

    private record RenderDatabaseSettings(String jdbcUrl, String username, String password) {
    }
}
