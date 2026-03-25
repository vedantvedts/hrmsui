export const sqlToRegularDate = (sqlDate) => {
  if (!sqlDate) return "-";

  const [year, month, day] = sqlDate.split("-");
  return `${day}-${month}-${year}`;
};

export const formatIndianRupee = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
