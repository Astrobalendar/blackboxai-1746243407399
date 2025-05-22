import axios from 'axios';

export const getPrediction = async (
  input: any,
  baseURL: string
): Promise<any> => {
  const response = await axios.post(`${baseURL}/predict`, input);
  return response.data;
};
