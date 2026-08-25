
import dayJs from "dayjs";

export const formatDate = (date , formate="DD/MM/YYYY") => {
  return dayJs(date).format(formate);
};