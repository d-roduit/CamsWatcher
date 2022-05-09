import { StyleSheet, Text, View } from 'react-native';

function CameraScreen() {
    return (
        <View style={styles.container}>
            <Text>CameraScreen</Text>
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
