import * as fs from "fs";
import * as path from "path";

const appNavigatorPath = path.join(
  process.cwd(),
  "app/frontend/src/navigation/AppNavigator.tsx"
);

const readAppNavigatorSource = () => fs.readFileSync(appNavigatorPath, "utf8");

describe("AppNavigator source contract", () => {
  it("declares stack params for MapMain, FloorSelectionScreen, and IndoorMapScreen", () => {
    const source = readAppNavigatorSource();

    expect(source).toContain("export type MapStackParamList = {");
    expect(source).toContain("MapMain: undefined;");
    expect(source).toContain("FloorSelectionScreen: {");
    expect(source).toContain("supportedFloors: string[];");
    expect(source).toContain("IndoorMapScreen: {");
    expect(source).toContain("selectedFloorNumber: string;");
    expect(source).toContain("buildingName: string;");
  });

  it("configures the nested map stack with all required screens", () => {
    const source = readAppNavigatorSource();

    expect(source).toContain("const MapStackNavigator = () => {");
    expect(source).toContain("<MapStack.Navigator screenOptions={{ headerShown: false }}>");
    expect(source).toContain('<MapStack.Screen name="MapMain" component={MapScreen} />');
    expect(source).toContain('name="FloorSelectionScreen"');
    expect(source).toContain("component={FloorSelectionScreen}");
    expect(source).toContain('<MapStack.Screen name="IndoorMapScreen" component={IndoorMapScreen} />');
  });

  it("applies drawer-level styling and behavior options", () => {
    const source = readAppNavigatorSource();

    expect(source).toContain('<Drawer.Navigator');
    expect(source).toContain('initialRouteName="CampusMap"');
    expect(source).toContain("const renderDrawerContent = (props: DrawerContentComponentProps) => (");
    expect(source).toContain("drawerContent={renderDrawerContent}");
    expect(source).toContain("headerStyle: { backgroundColor: \"#912338\" }");
    expect(source).toContain("headerTintColor: \"white\"");
    expect(source).toContain("drawerStyle: { backgroundColor: \"#912338\", width: 280 }");
    expect(source).toContain("drawerActiveTintColor: \"#ffffff\"");
    expect(source).toContain("drawerInactiveTintColor: \"rgba(255,255,255,0.6)\"");
    expect(source).toContain("drawerActiveBackgroundColor: \"rgba(255,255,255,0.15)\"");
    expect(source).toContain("drawerLabelStyle: { fontSize: 16 }");
  });

  it("defines CampusMap and Calendar drawer screens with updated labels and icons", () => {
    const source = readAppNavigatorSource();

    expect(source).toContain("<Drawer.Screen");
    expect(source).toContain('name="CampusMap"');
    expect(source).toContain("component={MapStackNavigator}");
    expect(source).toContain('title: "Campus Map"');
    expect(source).toContain('drawerLabel: "Map"');
    expect(source).toContain("headerShown: false");
    expect(source).toContain('<MaterialIcons name="map" size={24} color={color} />');

    expect(source).toContain('name="Calendar"');
    expect(source).toContain("component={CalendarSelectionScreen}");
    expect(source).toContain('title: "Calendar Selection"');
    expect(source).toContain('drawerLabel: "Calendars"');
    expect(source).toContain('<MaterialIcons name="calendar-today" size={24} color={color} />');
  });
});
