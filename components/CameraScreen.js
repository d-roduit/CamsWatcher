import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

function CameraScreen({ route }) {

    const { camera } = route.params;

    const getFirstAvailableStreamURL = () => {
        const streams = ["live", "day", "month", "year", "lifetime"];

        for (let stream of streams) {
            if (camera?.player?.[stream]?.available) {
                return camera.player[stream].embed || "";
            }
        }
        return "";
    }

    return (
        <WebView
            style={styles.container}
            source={{ uri: getFirstAvailableStreamURL() }}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "lightblue"
    },
});

export default CameraScreen;
