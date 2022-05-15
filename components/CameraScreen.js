import { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Platform, Share } from 'react-native';
import { Button } from '@rneui/themed';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import DataSection from './DataSection';
import MapView, { Marker } from 'react-native-maps';
import DarkMapStyle from '../DarkMapStyle';

function CameraScreen({ route }) {

    const { camera } = route.params;
    const informationsToDisplay = [
        {
            category: "location",
            field: "city",
            displayName: "City",
        },
        {
            category: "location",
            field: "region",
            displayName: "Region",
        },
        {
            category: "location",
            field: "country",
            displayName: "Country",
        },
        {
            category: "location",
            field: "continent",
            displayName: "Continent",
        },
        {
            category: "location",
            field: "timezone",
            displayName: "Timezone",
        },
        {
            category: "statistics",
            field: "views",
            displayName: "Views",
        },
    ];
    const availableStreams = [];

    // Fill availableStreams
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

    const share = () => {
        const content = {
            message:
                Platform.OS === "ios"
                    ? `Windy webcam - ${camera.title}`
                    : `Windy webcam - ${camera.title}\n${selectedStream.windyURL}`,
            url: selectedStream.windyURL,
            title: `Windy webcam - ${camera.title}`,
        };

        const options = {
            subject: `Windy webcam - ${camera.title}`,
        };

        Share.share(content, options)
            .catch(err => console.error(err));
    }

    return (
        <ScrollView
            style={styles.container}
            indicatorStyle={"white"}
            nestedScrollEnabled={true}
        >
            {loading && !loadingError && <ActivityIndicator style={{ marginVertical: 30 }} />}
            {!loading && loadingError && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="white" />
                    <Text style={[styles.whiteColor, { marginLeft: 10 }]}>Camera could not be loaded</Text>
                </View>
            )}
            {!loadingError && (
                <View
                    style={{ display: (!loading && !loadingError) ? "flex" : "none" }}
                >
                    <Text style={[styles.whiteColor, styles.cameraTitle]}>{camera.title}</Text>

                    <WebView
                        style={styles.webView}
                        containerStyle={styles.webView}
                        source={{ uri: selectedStream.embedURL }}
                        onLoadEnd={() => setLoading(false)}
                        onError={handleOnError}
                        onHttpError={handleOnError}
                        nestedScrollEnabled
                        allowsFullscreenVideo
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
                                    titleStyle={[styles.whiteColor, styles.streamTypesButtonTitle]}
                                    onPress={() => setSelectedStream(stream)}
                                />
                            ))
                        }
                    </View>

                    <View style={styles.narrowContainer}>
                        <DataSection title={"Information"}>
                            {
                                informationsToDisplay.map(info => (
                                    <View style={styles.informationRow} key={`${info.category}${info.field}`}>
                                        <Text style={styles.whiteColor}>{info.displayName} :</Text>
                                        <Text style={[styles.whiteColor, styles.informationValueColumn]}>{camera?.[info.category]?.[info.field] || "Unknown"}</Text>
                                    </View>
                                ))
                            }
                        </DataSection>

                        {!loading && !loadingError &&
                            <DataSection title={"Location"} containerStyle={{ marginTop: 30 }}>
                                <MapView
                                    style={styles.mapview}
                                    userInterfaceStyle={"dark"}
                                    customMapStyle={DarkMapStyle}
                                    toolbarEnabled={false}
                                    mapType={"standard"}
                                    initialRegion={{
                                        latitude: camera.location.latitude,
                                        latitudeDelta: 0.0322,
                                        longitude: camera.location.longitude,
                                        longitudeDelta: 0.0221,
                                    }}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: camera.location.latitude,
                                            longitude: camera.location.longitude
                                        }}
                                        title={camera.title}
                                    />
                                </MapView>
                            </DataSection>
                        }
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        <Button
                            title='Add to My cameras'
                            icon={{
                                name: "add",
                                type: "ionicon",
                                size: 18,
                                color: "white"
                            }}
                            buttonStyle={styles.button}
                            titleStyle={styles.whiteColor}
                            iconContainerStyle={styles.actionButtonIconContainer}
                            onPress={() => { }}
                        />

                        <Button
                            title='Share'
                            icon={{
                                name: Platform.OS === "ios" ? "share-outline" : "share-social",
                                type: "ionicon",
                                size: 18,
                                color: "white"
                            }}
                            buttonStyle={[styles.button, { marginTop: 15 }]}
                            titleStyle={styles.whiteColor}
                            iconContainerStyle={styles.actionButtonIconContainer}
                            onPress={share}
                        />
                    </View>

                    <View style={styles.bottomFillSpaceContainer} />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#19232D",
    },
    cameraTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    whiteColor: {
        color: "white",
    },
    webView: {
        flex: 0,
        height: 200,
        marginTop: 5,
        backgroundColor: "#19232D",
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
    streamTypesButtonTitle: {
        textTransform: "capitalize",
    },
    buttonContainer: {
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: "#19232D",
        borderColor: "dimgray",
        borderWidth: 1,
        borderRadius: 10,
    },
    narrowContainer: {
        flex: 1,
        marginTop: 30,
        marginHorizontal: 20,
    },
    informationRow: {
        marginVertical: 2.5,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    informationValueColumn: {
        width: "50%",
    },
    mapview: {
        height: 150,
        width: "100%",
    },
    actionButtonsContainer: {
        marginTop: 30,
        marginHorizontal: 20,
    },
    actionButtonIconContainer: {
        marginRight: 5,
    },
    bottomFillSpaceContainer: {
        height: 20,
    },
});

export default CameraScreen;
