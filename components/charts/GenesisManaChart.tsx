import { Chart } from "react-google-charts";
import { useManaCountByOrders } from "hooks/useMana";
import { ReactElement } from "react";
import { SUFFICES } from "@utils/constants";

export default function GenesisManaChart(): ReactElement {
  const { data } = useManaCountByOrders();
  let chartData = [];

  if (data?.orders) {
    const orderLookup = Array.from(data.orders).reduce((map, order) => {
      map[order.id] = Number(order.manasHeld);
      return map;
    }, {});
    chartData = [
      [
        "Genesis Mana",
        "Distilled",
        { role: "style" },
        "Unclaimed",
        { role: "style" }
      ],
      ...SUFFICES.map((item: any) => [
        item.label,
        orderLookup[item.value],
        item.color,
        item.manaTotal - orderLookup[item.value],
        "silver"
      ])
    ];
  }

  return (
    <Chart
      chartType="ColumnChart"
      width="100%"
      height="400px"
      data={chartData}
      options={{
        titlePosition: "none",
        chartArea: { width: "85%", height: "80%" },
        isStacked: true,
        legend: "none",
        backgroundColor: "#1f1f1f",
        vAxis: {
          title: "Count (log scale)",
          scaleType: "log",
          gridlines: {
            count: 4,
            color: "#8e8e8e"
          },
          titleTextStyle: {
            color: "#8e8e8e",
            fontSize: 12,
            fontName: "EB Garamond"
          }
        },
        hAxis: {
          textStyle: {
            color: "#fff",
            fontSize: 12,
            fontName: "EB Garamond"
          }
        },
        animation: {
          duration: 1000,
          easing: "out",
          startup: true
        },
        tooltip: {
          textStyle: {
            fontName: "EB Garamond",
            fontSize: 16
          }
        }
      }}
    />
  );
}
