import { StyleSheet, View, Text } from 'react-native';

function DataSection({ title, children, containerStyle, titleStyle, separatorStyle }) {

    const styles = StyleSheet.create({
        container: {
            ...containerStyle,
        },
        title: {
            color: "white",
            marginBottom: 5,
            fontWeight: "bold",
            ...titleStyle,
        },
        horizontalSeparator: {
            borderBottomColor: "dimgray",
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginBottom: 10,
            ...separatorStyle,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.horizontalSeparator} />
            {children}
        </View>
    );
}

export default DataSection;
