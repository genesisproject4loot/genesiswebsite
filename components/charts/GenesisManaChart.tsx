import { Chart } from "react-google-charts";
import { useManaCountByOrders } from "hooks/useMana";
import { ReactElement } from "react";

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
      ["Power", orderLookup["1"], "191D7E", 1328, "silver"],
      ["Giants", orderLookup["2"], "DAC931", 1384, "silver"],
      ["Titans", orderLookup["3"], "B45FBB", 1304, "silver"],
      ["Skill", orderLookup["4"], "1FAD94", 1256, "silver"],
      ["Perfection", orderLookup["5"], "2C1A72", 1280, "silver"],
      ["Brilliance", orderLookup["6"], "36662A", 1216, "silver"],
      ["Enlightenment", orderLookup["7"], "78365E", 1208, "silver"],
      ["Protection", orderLookup["8"], "4F4B4B", 1296, "silver"],
      ["Anger", orderLookup["9"], "9B1414", 1280, "silver"],
      ["Rage", orderLookup["10"], "77CE58", 1192, "silver"],
      ["Fury", orderLookup["11"], "C07A28", 1320, "silver"],
      ["Vitriol", orderLookup["12"], "511D71", 1296, "silver"],
      ["the Fox", orderLookup["13"], "949494", 1280, "silver"],
      ["Detection", orderLookup["14"], "DB8F8B", 1248, "silver"],
      ["Reflection", orderLookup["15"], "318C9F", 1232, "silver"],
      ["the Twins", orderLookup["16"], "00AE3B", 1200, "silver"]
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
