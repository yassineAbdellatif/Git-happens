import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  // --- TOP UI ---
  searchContainer: {
    position: "absolute",
    top: 50, // Adjust for Notch/SafeArea
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  searchText: { color: "#999" },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  routeHeader: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  routeTextStatic: {
    fontSize: 16,
    color: "#333",
  },
  routeDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  // --- RIGHT SIDE CONTROLS ---
  rightControlsContainer: {
    position: "absolute",
    right: 20,
    bottom: 240, // Anchor it above the bottom sheet
    alignItems: "flex-end",
    gap: 12,
    zIndex: 5,
  },
  recenterButton: {
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    minWidth: 85,
    alignItems: "center",
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#912338",
  },
  statusLabel: { fontSize: 9, fontWeight: "700", color: "#888" },
  statusValue: { fontSize: 14, fontWeight: "bold", color: "#912338" },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 4,
  },
  toggleButton: {
    backgroundColor: "#912338",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  toggleText: { color: "white", fontWeight: "bold" },

  // --- BOTTOM SHEET UI ---
  bottomSheetMock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    minHeight: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // Safety for home bar
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  sheetSubtitle: { color: "#666", marginTop: 5, textAlign: "center" },

  // --- DROPDOWN & BUTTONS ---
  dropdown: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 10,
    elevation: 5,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dropdownSubtext: { fontSize: 12, color: "#999", marginTop: 4 },
  directionsButton: {
    backgroundColor: "#912338",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  directionsButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  // --- ROUTING CONTENT ---
  routingSheetContent: {
    width: "100%",
    alignItems: "center",
  },
  routingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  modeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeModeButton: {
    backgroundColor: "#912338",
    borderColor: "#912338",
  },
  shuttleInfo: {
    backgroundColor: "#fff5f5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  shuttleText: { color: "#912338", fontWeight: "bold" },
  shuttleSubtext: { fontSize: 11, color: "#666" },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  closeButton: {
    padding: 8,
  },
  routeInputs: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  originOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  originOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  //step by step instruction elements
  routeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  summaryInfo: {
    flexDirection: "column",
  },
  durationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
  },
  endNavButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endNavText: {
    color: "#912338",
    fontWeight: "bold",
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  destinationText: {
    fontSize: 16,
    color: "#333",
  },
  navigationSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    elevation: 10,
    zIndex: 10,
    maxHeight: "60%",
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
  },
  stepsContainer: {
    marginTop: 5,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
    gap: 10,
  },
  stepTextContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  stepInstruction: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  stepDistance: {
    fontSize: 12,
    color: "#999",
  },
});