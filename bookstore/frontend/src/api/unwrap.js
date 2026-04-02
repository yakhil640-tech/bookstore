export async function unwrapApi(promise) {
  const response = await promise;
  return response.data;
}
