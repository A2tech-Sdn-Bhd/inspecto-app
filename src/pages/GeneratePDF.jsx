import {
  PDFViewer,
  Page,
  View,
  Text,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import ChartJsImage from "chartjs-to-image";
import { useEffect, useState } from "react";
import { Buffer } from "buffer/";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
window.Buffer = Buffer;
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

  useEffect(() => {
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
          odomVal: listImg[i][2],
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
      const columns = Object.keys(data[0]);

      const myChart = new ChartJsImage();
      myChart.setConfig({
        type: "line",
        data: {
          labels: data.map((item) => item[columns[0]]),
          datasets: [
            {
              label: "Low Range",
              data: data.map((item) => item[columns[1]]),
              borderColor: "rgb(255, 99, 132)",
              borderWidth: 1,
            },
            {
              label: "Diameter",
              data: data.map((item) => item[columns[2]]),
              borderColor: "rgb(54, 162, 235)",
              borderWidth: 1,
            },
            {
              label: "High Range",
              data: data.map((item) => item[columns[3]]),
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      myChart.toDataUrl().then((data) => setImageSrc(data));
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
      <PdfDoc />
    </div>
  );
};

export default GeneratePDF;
