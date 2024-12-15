import React from "react";
import { Scatter } from "react-chartjs-2"



const ScatterChart = () => {

  const labels = ["January", "February", "March", "April", "May", "June", "July"]

  const dataPoints = [

    { x: 20, y: 80 },

    { x: 30, y: 70 },

    { x: 50, y: 60 },

    { x: 40, y: 50 },

    { x: 70, y: 40 },

    { x: 60, y: 30 },

    { x: 90, y: 20 },

  ]



const data = {

    labels,

    datasets: [

      {

        label: "Scatter Chart: Monthly Sales vs Expenses",

        data: dataPoints,

        backgroundColor: "rgba(53, 162, 235)",

        borderColor: "rgb(53, 162, 235)",

        borderWidth: 1,

        pointRadius: 5, // Adjust the size of the points

      },

    ],

  }



const options = {

    responsive: true,

    scales: {

      x: {

        beginAtZero: true,

        title: {

          display: true,

          text: "Sales",

        },

      },

      y: {

        beginAtZero: true,

        title: {

          display: true,

          text: "Expenses",

        },

      },

    },

    plugins: {

      legend: {

        position: "top",

      },

      title: {

        display: true,

        text: "Monthly Sales vs Expenses Scatter Plot",

      },

    },

  }



return <Scatter data={data} options={options} />

}



export default ScatterChart


