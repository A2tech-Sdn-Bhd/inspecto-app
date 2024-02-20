import {
  PDFViewer,
  Page,
  View,
  Text,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
const GeneratePDF = () => {
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const [imageSrc, setImageSrc] = useState(null);
  const savedDate = new Date().toLocaleDateString();
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tripInformation = JSON.parse(localStorage.getItem("tripInformation"));
  const tripID = tripInformation.tripID;
  const tripName = tripInformation.tripName;
  const inspectoName = tripInformation.inspectoName;
  const place = tripInformation.place;
  const triptype = tripInformation.tripType;
  const savedTime = tripInformation.time;
  const currentTime = new Date().toLocaleTimeString();
  const endTime = [[tripID, currentTime]];
  const navigate = useNavigate();
  let chartData;
  let options;

  useEffect(() => {
    localStorage.setItem(
      "chart_data",
      JSON.stringify([
        {
          x: "-1.13",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.10",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.08",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.06",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.04",
          diameter: "29.38",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.02",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.00",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.03",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.06",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.08",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.10",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.13",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.17",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.19",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.21",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.23",
          diameter: "29.79",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.25",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.27",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.29",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.31",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.33",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.36",
          diameter: "29.59",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.39",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.41",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.43",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.45",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.48",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.50",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.52",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.54",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.57",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
        {
          x: "-1.59",
          diameter: "20.55",
          lowRange: "45.00",
          highRange: "15.00",
        },
      ])
    );
    const verifyCookie = async () => {
      if (!cookies.token_app) {
        navigate("/login");
      } else {
        const { data } = await axios.post(
          `${API_URL}`,
          { fromwhere: "app" },
          { withCredentials: true }
        );
        const { status } = data;
        return status
          ? console.log("")
          : (removeCookie("token_app"), navigate("/login"));
      }
    };

    verifyCookie();
  }, [cookies, navigate, removeCookie]);
  if (!localStorage.getItem(`endTime_${tripID}`)) {
    localStorage.setItem(`endTime_${tripID}`, JSON.stringify(endTime));
  }
  const endTimeArray = JSON.parse(
    localStorage.getItem(`endTime_${tripInformation.tripID}`)
  );
  const endTimeLength = endTimeArray.length;
  const endTimeIndex = endTimeLength - 1;
  const endTimeValue = endTimeArray[endTimeIndex][1];
  const storageKey = `imgSnapshot_${tripID}`;
  const imageData = [];
  if (localStorage && storageKey in localStorage) {
    const listImg = JSON.parse(localStorage.getItem(storageKey));
    if (listImg) {
      const listImgLength = listImg.length;

      for (let i = 0; i < listImgLength; i++) {
        imageData.push({
          inspectoName: inspectoName,
          src: listImg[i][1],
          odomVal: parseFloat(listImg[i][2]).toFixed(2),
        });
      }
    }
  }
  let tripType = triptype;
  if (triptype == "Cleaning") {
    tripType = "Cleaning Report";
  } else if (triptype == "Inspection") {
    tripType = "Inspection Report";
  }
  const titlename =
    tripType +
    " " +
    tripName +
    " " +
    inspectoName +
    " " +
    place +
    " " +
    savedDate +
    ".pdf";
  const styles = StyleSheet.create({
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 0,
      margin: "20px",
    },
    tableRow: {
      margin: "auto",
      flexDirection: "row",
      maxHeight: "200px",
      paddingVertical: 10,

      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
    },
    tableCol: {
      width: "25%",
    },
    tableCol3: {
      width: "33.333333333%",
    },
    tableCell: {
      margin: "auto",
      fontSize: 10,
    },
    rowTitle: {
      fontSize: 32,
      fontWeight: "bold",
      margin: "auto",
    },
    textLeft: {
      textAlign: "left",
    },
    imageStyle: {
      maxWidth: "300px",
      maxHeight: "400px",
      padding: "10px",
    },
    logoStyle: {
      maxWidth: "100px",
      maxHeight: "100px",
      padding: "10px",
    },
    tagCenter: {
      alignSelf: "center",
    },
    boldText: {
      fontWeight: "bold",
    },
  });
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("chart_data"));
    if (data && data.length > 0) {
      const lowRangeValues = data.map((item) => parseFloat(item.lowRange));
      const highRangeValues = data.map((item) => parseFloat(item.highRange));

      const lowRangeMin = lowRangeValues - 10;
      const highRangeMax = highRangeValues + 10;
      const columns = Object.keys(data[0]);
      const xValues = data.map((item) => parseFloat(item.x));
      const diameterValues = data.map((item) => parseFloat(item.diameter));
      chartData = {
        labels: xValues,
        datasets: [
          {
            label: "Diameter",
            data: diameterValues,
            fill: false,
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgba(255, 99, 132, 0.2)",
          },
          {
            label: "Low Range",
            data: lowRangeValues,
            fill: false,
            backgroundColor: "rgb(54, 162, 235)",
            borderColor: "rgba(54, 162, 235, 0.2)",
          },
          {
            label: "High Range",
            data: highRangeValues,
            fill: false,
            backgroundColor: "rgb(75, 192, 192)",
            borderColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      };
      console.log(chartData);
      options = {
        scales: {
          y: {
            beginAtZero: true,
            min: lowRangeMin,
            max: highRangeMax,
          },
        },
      };
    }
  }, []);

  const PdfDoc = () => (
    <PDFViewer className="h-screen w-screen">
      <Document title={titlename}>
        <Page style={styles.body}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Image
                  style={{
                    ...styles.logoStyle,
                    ...styles.tagCenter,
                    ...styles.tableCell,
                  }}
                  src={"src/assets/inspecto.png"}
                />
              </View>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text style={styles.tableCell}>INSPECTo</Text>
                <Text style={styles.tableCell}>www.a2tech.my</Text>
                <Text style={styles.tableCell}>admin@a2tech.my</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "100%" }]}>
                <Text style={{ ...styles.tableCell, ...styles.rowTitle }}>
                  {tripType}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCell}>Date:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {formattedDate}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCell}>Username:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {username}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCell}>Email:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {email}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Date:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {savedTime}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>End Time:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {endTimeValue}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Start Time:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {tripName}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Inspector Name:</Text>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  {inspectoName}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "100%" }]}>
                <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                  Place: {place}
                </Text>
              </View>
            </View>
            {imageSrc ? (
              <View style={{ ...styles.tableRow, ...styles.tagCenter }}>
                <View style={[styles.tableCol, { width: "100%" }]}>
                  <Image
                    style={{
                      ...styles.imageStyle,
                      ...styles.tagCenter,
                      ...styles.tableCell,
                    }}
                    src={imageSrc}
                  />
                </View>
              </View>
            ) : (
              <></>
            )}
            {imageData ? (
              imageData.map((item, index) => (
                <View
                  key={index}
                  style={{ ...styles.tableRow, ...styles.tagCenter }}
                >
                  <View style={[styles.tableCol, { width: "100%" }]}>
                    <Text style={{ ...styles.tableCell, ...styles.boldText }}>
                      Distance(m): {item.odomVal}
                    </Text>
                    <Image
                      style={{
                        ...styles.imageStyle,
                        ...styles.tagCenter,
                        ...styles.tableCell,
                      }}
                      src={item.src}
                    />
                  </View>
                </View>
              ))
            ) : (
              <p>No image data available</p>
            )}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );

  return (
    <div>
      <>
        <PdfDoc />
        <Line data={chartData} options={options} />
      </>
    </div>
  );
};

export default GeneratePDF;
