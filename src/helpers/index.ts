export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const numToFixed = (num: number, fixedNum: number) => {
  const fixed = num.toFixed(fixedNum);

  const parsed = parseFloat(fixed);

  return parsed;
};
