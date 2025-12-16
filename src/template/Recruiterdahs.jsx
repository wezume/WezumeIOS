import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Header from "./header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const RecruiterDashboard = () => {
  const navigation = useNavigation();

  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [jobIdList] = useState(["JOB-1001", "JOB-1002", "JOB-1003", "JOB-1004"]);
  const [selectedJobId, setSelectedJobId] = useState("JOB-1001");

  const [modalVisible, setModalVisible] = useState(false);

  const [jobAnalytics, setJobAnalytics] = useState({
    views: 120,
    likes: 80,
    comments: 30,
    applications: 12,
  });

  useEffect(() => {
    // Random demo analytics
    setJobAnalytics({
      views: Math.floor(Math.random() * 200),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      applications: Math.floor(Math.random() * 25),
    });
  }, [selectedJobId]);

  useEffect(() => {
    const loadUserInfo = async () => {
      setUserName((await AsyncStorage.getItem("firstName")) || "");
      setProfileImage((await AsyncStorage.getItem("profileUrl")) || null);
    };
    loadUserInfo();
  }, []);

  // ⭐ Navigation added here
  const menuItems = [
    {
      label: "Liked Videos",
      icon: "favorite",
      colors: ["#ff4f81", "#ff8fb5"],
      onPress: () => navigation.navigate("LikeScreen"),
    },
    {
      label: "Commented Videos",
      icon: "chat",
      colors: ["#f4a329", "#ffca6f"],
      // onPress: () => navigation.navigate("CommentedVideos"),
    },
    {
      label: "Videos",
      icon: "work",
      colors: ["#1abc9c", "#2ecc71"],
      onPress: () => navigation.navigate("HomeScreen"),
    },
    {
      label: "Advanced Search",
      icon: "search",
      colors: ["#4b79ff", "#70b0ff"],
      onPress: () => navigation.navigate("profile"),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 25 },
      ]}
    >
      <Header userName={userName} profile={profileImage} />

      <ImageBackground source={require("./assets/login.jpg")} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* ⭐ TOP 4 NAVIGABLE CARDS */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                activeOpacity={0.85}
                onPress={item.onPress}
              >
                <LinearGradient colors={item.colors} style={styles.iconBox}>
                  <MaterialIcons name={item.icon} size={32} color="#fff" />
                </LinearGradient>

                <Text style={styles.label}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ⭐ 5th Full Width Card */}
          <View style={styles.cardFull}>
            <LinearGradient colors={["#9b59b6", "#be90d4"]} style={styles.iconBoxFull}>
              <MaterialIcons name="badge" size={32} color="#fff" />
            </LinearGradient>

            <Text style={styles.labelFull}>Job ID Videos</Text>

            {/* Open modal */}
            <TouchableOpacity
              style={styles.inputSelect}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.inputSelectText}>{selectedJobId}</Text>
              <MaterialIcons name="arrow-drop-down" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ⭐ CENTER MODAL FOR JOB ID SELECT */}
          <Modal visible={modalVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Select Job ID</Text>

                <FlatList
                  data={jobIdList}
                  keyExtractor={(item) => item}
                  style={{ maxHeight: 200, width: "100%" }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedJobId(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ⭐ MODERN BAR CHART */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Analytics — {selectedJobId}</Text>

            <BarChart
              data={{
                labels: ["Views", "Likes", "Comments", "Apps"],
                datasets: [
                  {
                    data: [
                      jobAnalytics.views,
                      jobAnalytics.likes,
                      jobAnalytics.comments,
                      jobAnalytics.applications,
                    ],
                  },
                ],
              }}
              width={screenWidth * 0.9}
              height={250}
              fromZero
              withInnerLines={false}
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ece8ff",
                decimalPlaces: 0,
                barPercentage: 0.55,
                color: () => "#6c47ff",
                labelColor: () => "#333",
                propsForBars: {
                  rx: 12,
                  ry: 12,
                },
              }}
              style={styles.chartStyle}
            />
          </View>

          <View style={{ height: 50 }} />

        </ScrollView>
      </ImageBackground>
    </View>
  );
};

/* ------------------- STYLES ------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  background: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 20 },

  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 28,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  cardFull: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 22,
  },

  iconBoxFull: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  labelFull: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  inputSelect: {
    width: "85%",
    height: 42,
    backgroundColor: "#9b59b6",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputSelectText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* -------- MODAL -------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalItemText: { fontSize: 16, color: "#333" },

  modalCloseButton: { marginTop: 12 },

  modalCloseText: { color: "#6c47ff", fontSize: 16, fontWeight: "700" },

  /* -------- CHART -------- */
  chartContainer: { alignItems: "center", marginTop: 10 },

  chartTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  chartStyle: { borderRadius: 16, padding: 5 },
});

export default RecruiterDashboard;
