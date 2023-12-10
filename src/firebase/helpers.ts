import moment from "moment";
import _ from "lodash";

import type { Grouped } from "@/types";

export const getSnapsData = (snaps: any) => {
  const data = snaps.docs.map((snap: any) => getSnapData(snap));

  return data;
};

export const getSnapData = (snap: any) => {
  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const getCurrentISODate = () => {
  return new Date().toISOString();
};

export const getMonthYearData = () => {
  const date = moment();

  const month = date.format("MMMM");
  const year = Number(date.format("YYYY"));

  return {
    month,
    year,
  };
};

export const groupBasedOnKey = <T, U>(objects: T[], field: keyof T) => {
  const grouped: Grouped<T, U>[] = [];

  objects.forEach((object: T) => {
    const property = object[field] as U;
    const match = grouped.find((eachGroup) => eachGroup.title === property);

    if (match) {
      match.list.push(object);
    } else {
      grouped.push({
        title: property,
        list: [object],
      });
    }
  });

  return grouped;
};
