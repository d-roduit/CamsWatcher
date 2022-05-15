import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './CameraScreen';

const Stack = createNativeStackNavigator();

function StackNavigator({ routeName, component }) {
    return (
        <Stack.Navigator
            initialRouteName={routeName}
            screenOptions={{
                headerStyle: styles.headerStyle,
                headerTintColor: 'white',
                headerTitleStyle: styles.headerTitleStyle,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name={routeName} component={component} />
            <Stack.Screen name="Camera" component={CameraScreen} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: '#203040',
    },
    headerTitleStyle: {
        fontWeight: 'bold',
    },
    tabBarStyle: {
        backgroundColor: '#203040',
        borderTopWidth: 0,
    }
});

export default StackNavigator;
