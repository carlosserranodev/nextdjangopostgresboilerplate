import React from 'react';
import { Bar } from "react-chartjs-2"



const BarChart = () => {

  const options = {

    responsive: true,

    plugins: {

      legend: {

        position: "top",

      },

      title: {

        display: true,

        text: "Bar Chart: Quarterly Revenue & Expenses Comparison",

      },

    },

  }



const labels = ["Product A", "Product B", "Product C", "Product D", "Product E"]

  const data1 = [45, 75, 55, 90, 60]

  const data2 = [65, 40, 70, 80, 50]



const data = {

    labels,

    datasets: [

      {

        label: "Q1 Sales",

        data: data1,

        backgroundColor: "rgba(75, 192, 192)",

        borderColor: "rgb(75, 192, 192)",

        borderWidth: 1,

      },

      {

        label: "Q2 Sales",

        data: data2,

        backgroundColor: "rgba(255, 159, 64)",

        borderColor: "rgb(255, 159, 64)",

        borderWidth: 1,

      },

    ],

  }



return <Bar options={options} data={data} />

}



export default BarChart

