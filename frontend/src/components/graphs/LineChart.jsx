import React from 'react';
import { Line } from 'react-chartjs-2'; 

const LineChart = () => {

    const options = {
  
      responsive: true,
  
      plugins: {
  
        legend: {
  
          position: "top",
  
        },
  
        title: {
  
          display: true,
  
          text: "Line Chart: Monthly Sales Trend for Products A & B",
  
        },
  
      },
  
    }
  
  
  
  const labels = ["January", "February", "March", "April", "May", "June", "July"]
  
  
  
  const productASales = [120, 135, 125, 145, 160, 150, 170]
  
  
  
  const productBSales = [80, 75, 95, 100, 110, 105, 120, 115]
  
  
  
  const data = {
  
      labels,
  
      datasets: [
  
        {
  
          label: "Product A Sales",
  
          data: productASales,
  
          borderColor: "rgb(255, 99, 132)",
  
          backgroundColor: "rgba(255, 99, 132)",
  
        },
  
        {
  
          label: "Product B Sales",
  
          data: productBSales,
  
          borderColor: "rgb(53, 162, 235)",
  
          backgroundColor: "rgba(53, 162, 235)",
  
        },
  
      ],
  
    }
  
  
  
  return <Line options={options} data={data} />
  
  }
  
  
  
  export default LineChart
  
