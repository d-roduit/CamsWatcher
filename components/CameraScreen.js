import { StyleSheet, Text, View } from 'react-native';

function CameraScreen({ route, navigation }) {

    const { camera } = route.params;

    return (
        <View style={styles.container}>
            <Text>{camera.title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "lightblue"
    },
});

export default CameraScreen;
