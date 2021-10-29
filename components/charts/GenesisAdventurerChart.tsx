import { Chart } from "react-google-charts";
import { ReactElement } from "react";
import { useAdventurerCountByOrders } from "hooks/useAdventurer";
import { SUFFICES } from "@utils/constants";

export default function GenesisAdventurerChart(): ReactElement {
  const { data } = useAdventurerCountByOrders();
  let chartData = [];
  let totals = {
    resurrected: 0,
    total: 0
  };
  if (data?.orders) {
    const orderLookup = Array.from(data.orders).reduce((map, order) => {
      map[order.id] = Number(order.adventurersHeld);
      return map;
    }, {});
    chartData = [
      [
        "Genesis Adventurer",
        "Resurrected",
        { role: "style" },
        "Unclaimed",
        { role: "style" }
      ],
      ...SUFFICES.map((item: any) => {
        totals.resurrected += orderLookup[item.value];
        totals.total += item.adventurerTotal;
        return [
          item.label,
          orderLookup[item.value],
          item.color,
          item.adventurerTotal,
          "silver"
        ];
      }).sort((a, b) => b[1] - a[1])
    ];
  }

  return (
    <div>
      <h1 className="py-2 text-xl font-bold text-center">
        {totals.resurrected} out of {totals.total} Adventurers Resurrected
      </h1>
      <Chart
        chartType="BarChart"
        width="100%"
        height="336px"
        data={chartData}
        options={{
          titlePosition: "none",
          chartArea: { width: "65%", height: "100%" },
          isStacked: true,
          legend: "none",
          backgroundColor: "#1f1f1f",
          bar: {
            groupWidth: "60%"
          },
          hAxis: {
            title: "Count",
            gridlines: {
              count: 4,
              color: "#8e8e8e"
            },
            titleTextStyle: {
              color: "#8e8e8e",
              fontSize: 14,
              fontName: "EB Garamond"
            }
          },
          vAxis: {
            textStyle: {
              color: "#fff",
              fontSize: 14,
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
    </div>
  );
}
