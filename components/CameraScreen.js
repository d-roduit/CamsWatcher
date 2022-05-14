import { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import { Button } from '@rneui/themed';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

function CameraScreen({ route }) {

    const { camera } = route.params;
    const availableStreams = [];

    for (const streamType in camera?.player) {
        if (camera?.player?.[streamType]?.available) {
            availableStreams.push({
                type: streamType,
                windyURL: camera?.player?.[streamType]?.link || `https://www.windy.com/webcams/${camera.id}`,
                embedURL: camera?.player?.[streamType]?.embed || "https://error"
            });
        }
    }

    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);
    const [selectedStream, setSelectedStream] = useState(availableStreams[0] || {});

    const handleOnError = () => {
        setLoadingError(true);
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            { loading && !loadingError && <ActivityIndicator style={{marginVertical: 30}} />}
            { !loading && loadingError && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="white" />
                    <Text style={[styles.whiteColor, { marginLeft: 10 }]}>Camera could not be loaded</Text>
                </View>
            )}
            { !loadingError && (
                <View style={{ display: (!loading && !loadingError) ? "flex" : "none" }}>
                    <Text style={styles.cameraTitle}>{camera.title}</Text>

                    <WebView
                        style={styles.webView}
                        containerStyle={styles.webView}
                        source={{ uri: selectedStream.embedURL }}
                        onLoadEnd={() => setLoading(false)}
                        onError={handleOnError}
                        onHttpError={handleOnError}
                        setBuiltInZoomControls={false}
                        scrollEnabled={false}
                        allowsFullscreenVideo={true}
                        injectedJavaScript={
                            `(function() {
                                const aElements = Array.from(document.querySelectorAll('a[target]'));
                                for (const aElement of aElements) {
                                    aElement.setAttribute("target", "_self");
                                }
                            })();`
                        }
                    />

                    <View style={styles.streamTypesButtonsContainer}>
                        {
                            availableStreams.map(stream => (
                                <Button
                                    key={stream.type}
                                    title={stream.type}
                                    containerStyle={styles.buttonContainer}
                                    buttonStyle={[
                                        styles.button,
                                        selectedStream.type === stream.type ? { backgroundColor: "rgba(173, 216, 230, 0.3)", borderColor: "lightblue" } : {}
                                    ]}
                                    titleStyle={styles.buttonTitle}
                                    onPress={() => setSelectedStream(stream)}
                                />
                            ))
                        }
                    </View>

                    <View style={styles.infoContainer}>

                        <Text style={[
                            styles.whiteColor,
                            styles.infoTitle
                        ]}>
                            Info
                        </Text>

                        <View style={styles.horizontalSeparator}/>

                        <Text style={styles.whiteColor}>City: {camera?.location?.city || "Unknown"}</Text>
                        <Text style={styles.whiteColor}>Region: {camera?.location?.region || "Unknown"}</Text>
                        <Text style={styles.whiteColor}>Country: {camera?.location?.country || "Unknown"}</Text>
                        <Text style={styles.whiteColor}>Continent: {camera?.location?.continent || "Unknown"}</Text>
                        <Text style={styles.whiteColor}>Timezone: {camera?.location?.timezone || "Unknown"}</Text>
                        <Text style={styles.whiteColor}>Number of views: {camera?.statistics?.views || "Unknown"}</Text>

                        <Button
                            title='Save'
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                            onPress={() => {}}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    cameraTitle: {
        color: "lightblue",
        fontSize: 18,
        fontWeight:"bold",
        textAlign: "center",
        marginTop: Platform.OS === "ios" ? 15 : 0,
    },
    whiteColor: {
        color: "white",
    },
    webView: {
        flex: 0,
        height: 200,
        marginTop: 5,
        backgroundColor: "black",
    },
    errorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 30,
    },
    streamTypesButtonsContainer: {
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonContainer: {
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: "black",
        borderColor: "dimgray",
        borderWidth: 1,
        borderRadius: 10,
    },
    buttonTitle: {
        color: "lightgray",
        textTransform: 'capitalize',
    },
    infoContainer: {
        marginHorizontal: 20,
    },
    infoTitle: {
        marginTop: 20,
        marginBottom: 5,
    },
    horizontalSeparator: {
        borderBottomColor: "dimgray",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});


export default CameraScreen;
