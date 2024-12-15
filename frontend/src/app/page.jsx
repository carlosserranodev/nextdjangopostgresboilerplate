'use client'
import React from "react";
import FormTask from "./components/FormTask";
import ListTask from "./components/ListTask";
import DoughnutChart from "./components/graphs/DoughnutChart";


import { registerCharts } from "./registerCharts";

registerCharts()
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
  <div className="container mx-auto">
    <h1>Task App</h1>

    <div className="flex gap-x-10">
      <FormTask />
      <ListTask />
    </div>
    <DoughnutChart />
  </div>
  )
}
