import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './components/HomeScreen';
import MapScreen from './components/MapScreen';
import CamerasListScreen from './components/CamerasListScreen';
import { Ionicons } from 'react-native-vector-icons';

const Tab = createBottomTabNavigator();

<Ionicons name="location" size={24} color="black" />

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
            case "Map":
                iconName = focused ? 'location' : 'location-outline';
                break;
            case "Cameras":
                iconName = focused ? 'camera' : 'camera-outline';
                break;
            case "Home":
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
                initialRouteName="Home"
                screenOptions={({ route }) => ({
                    headerStyle: { backgroundColor: 'black' },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' },
                    tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
                    tabBarStyle: { backgroundColor: 'black', borderTopWidth: 0 },
                    tabBarActiveTintColor: 'lightblue',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Map" component={MapScreen} />
                <Tab.Screen name="Cameras" component={CamerasListScreen} />
                <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'My cameras' }}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default App;
