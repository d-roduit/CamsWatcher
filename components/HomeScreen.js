import { StyleSheet, Text, View } from 'react-native';

function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text>HomeScreen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "lightblue"
    },
});

export default HomeScreen;
