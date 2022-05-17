import { StyleSheet, StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './components/HomeScreen';
import MapScreen from './components/MapScreen';
import CamerasListScreen from './components/CamerasListScreen';
import StackNavigator from './components/StackNavigator';
import { Ionicons } from 'react-native-vector-icons';

const Tab = createBottomTabNavigator();

// Temporary fix to suppress PropType warnings which are due
// to dependencies wich use these old props.
// The warnings will eventually disappear when the dependencies packages update their code.
LogBox.ignoreLogs([
    "exported from 'deprecated-react-native-prop-types'.",
]);

function App() {

    const getTabBarIcon = (route, focused, color, size) => {
        let iconName;

        switch (route.name) {
            case "MapStackNavigator":
                iconName = focused ? 'location' : 'location-outline';
                break;
            case "CamerasListStackNavigator":
                iconName = focused ? 'camera' : 'camera-outline';
                break;
            case "HomeStackNavigator":
                iconName = focused ? 'home' : 'home-outline';
                break;
            default:
                iconName = focused ? 'alert-circle' : 'alert-circle-outline';
                break;
        }

        return <Ionicons name={iconName} size={size} color={color} />;
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <Tab.Navigator
                initialRouteName="HomeStackNavigator"
                screenOptions={({ route }) => ({
                    headerStyle: styles.headerStyle,
                    headerTintColor: 'white',
                    headerTitleStyle: styles.headerTitleStyle,
                    tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
                    tabBarStyle: styles.tabBarStyle,
                    tabBarActiveTintColor: 'lightblue',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen
                    name="MapStackNavigator"
                    children={() => <StackNavigator routeName={"Map"} component={MapScreen} />}
                    options={{ headerShown: false, title: 'Map' }}
                />
                <Tab.Screen
                    name="CamerasListStackNavigator"
                    children={() => <StackNavigator routeName={"Cameras"} component={CamerasListScreen} />}
                    options={{ headerShown: false, title: 'Cameras' }}
                />
                <Tab.Screen
                    name="HomeStackNavigator"
                    children={() => <StackNavigator routeName={"My cameras"} component={HomeScreen} />}
                    options={{ headerShown: false, title: 'My cameras' }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: "#203040",
    },
    headerTitleStyle: {
        fontWeight: "bold",
    },
    tabBarStyle: {
        backgroundColor: "#203040",
        borderTopWidth: 0,
    },
});

export default App;
