export const extractGu = (address: string): string | null => {
  const match = address?.match(/([가-힣]+구)/);
  return match ? match[1] : null;
};
