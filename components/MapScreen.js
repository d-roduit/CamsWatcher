import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Modal, Button, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FormatHelper from '../FormatHelper';
import DarkMapStyle from '../DarkMapStyle';
import { API_BASE_URL, API_KEY } from '@env';

function MapScreen({ navigation }) {

    const [loadingUserLocation, setLoadingUserLocation] = useState(false);
    const [initialRegion, setInitialRegion] = useState({
        latitude: 20.700689035749388,
        latitudeDelta: 110.88454576378447,
        longitude: 20.830085165798664,
        longitudeDelta: 126.56248658895493
    });
    const [cameras, setCameras] = useState([]);

    const getUserLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return null;
        }

        setLoadingUserLocation(true);
        const userLocation = await Location.getCurrentPositionAsync({});
        if (typeof userLocation === "undefined") {
            setLoadingUserLocation(false);
            Alert.alert('Location not found');
            return null;
        }
        setLoadingUserLocation(false);

        return userLocation;
    }

    const getCoordinatesForAPIFromLocation = ({ latitude, latitudeDelta, longitude, longitudeDelta }) => {
        const zoomRangeAllowed = {
            minZoom: 4,
            maxZoom: 18,
        };

        let zoom = Math.round(Math.log(360 / longitudeDelta) / Math.LN2) + 1;

        if (zoom < zoomRangeAllowed.minZoom) {
            zoom = zoomRangeAllowed.minZoom;
        } else if (zoom > zoomRangeAllowed.maxZoom) {
            zoom = zoomRangeAllowed.maxZoom;
        }

        /**
         * The reason for these bounding box parameters is explained in this section of the doc:
         * https://api.windy.com/webcams/versions-transfer#webcams-map-cluster
         */
        const boundingBoxRangeAllowed = {
            maxLatitudeDeltaForMinZoom: 22.5,
            maxLongitudeDeltaForMinZoom: 45,
            divisionFactorForSubsequentZoom: 2,
        };

        const maxLatitudeDeltaForCurrentZoom = boundingBoxRangeAllowed.maxLatitudeDeltaForMinZoom / Math.pow(boundingBoxRangeAllowed.divisionFactorForSubsequentZoom, zoom - zoomRangeAllowed.minZoom);
        const maxLongitudeDeltaForCurrentZoom = boundingBoxRangeAllowed.maxLongitudeDeltaForMinZoom / Math.pow(boundingBoxRangeAllowed.divisionFactorForSubsequentZoom, zoom - zoomRangeAllowed.minZoom);

        if (latitudeDelta > maxLatitudeDeltaForCurrentZoom) {
            latitudeDelta = maxLatitudeDeltaForCurrentZoom;
        }

        if (longitudeDelta > maxLongitudeDeltaForCurrentZoom) {
            longitudeDelta = maxLongitudeDeltaForCurrentZoom;
        }

        return {
            topRight: {
                latitude: latitude + (latitudeDelta / 2),
                longitude: longitude + (longitudeDelta / 2)
            },
            bottomLeft: {
                latitude: latitude - (latitudeDelta / 2),
                longitude: longitude - (longitudeDelta / 2)
            },
            zoom,
        };
    }

    const determineInitialAreaToDisplay = async () => {
        let areaToDisplay = getCoordinatesForAPIFromLocation(initialRegion);

        try {
            const userLocation = await getUserLocation();
            if (userLocation !== null) {
                const userRegion = {
                    latitude: userLocation.coords.latitude,
                    latitudeDelta: 0.5,
                    longitude: userLocation.coords.longitude,
                    longitudeDelta: 0.5,
                };
                areaToDisplay = getCoordinatesForAPIFromLocation(userRegion);
                setInitialRegion(userRegion);
            }
        } catch (err) {
            console.error(err);
        }

        return areaToDisplay;
    }

    const fetchCamerasInArea = async ({ topRight, bottomLeft, zoom }) => {
        const webcamDataToFetch = [
            "images",
            "location",
            "player",
        ];

        const getCamerasAPIEndpoint = `${API_BASE_URL}/map/clusters?northLat=${topRight.latitude}&southLat=${bottomLeft.latitude}&eastLon=${topRight.longitude}&westLon=${bottomLeft.longitude}&zoom=${zoom}&include=${webcamDataToFetch.join(",")}`;

        try {
            const response = await fetch(getCamerasAPIEndpoint, {
                headers: {
                    "Content-Type" : "application/json",
                    "x-windy-api-key": API_KEY,
                }
            });

            const webcams = response.ok ? await response.json() : null;

            if (!webcams) {
                setCameras([]);
            } else {
                setCameras(webcams.map(webcam => FormatHelper.removeCityFromTitle(webcam) || {}));
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleOnRegionChangeComplete = async region => {
        await fetchCamerasInArea(getCoordinatesForAPIFromLocation(region))
    };

    const renderCameraMarker = (camera, index) => {
        return (
            <Marker
                key={index}
                coordinate={{
                    latitude: camera.location.latitude,
                    longitude: camera.location.longitude
                }}
                image={{ uri: camera.images.current.icon }}
            >
                <Callout
                    tooltip
                    onPress={mapEvent => {
                        if (
                            Platform.OS === 'ios' ||
                            mapEvent.nativeEvent.action === 'marker-inside-overlay-press' ||
                            mapEvent.nativeEvent.action === 'callout-inside-press'
                        ) {
                            return;
                        }

                        navigation.navigate("Camera", { camera });
                    }}
                    style={styles.customView}
                >
                    <View style={styles.calloutContainer}>
                        <View style={styles.bubble}>
                            <View style={styles.amount}>
                                <Text style={styles.calloutText}>{camera.title}</Text>
                                <Button onPress={() => navigation.navigate("Camera", { camera })} title="Open" />
                            </View>
                        </View>
                        <View style={styles.arrowBorder} />
                        <View style={styles.arrow} />
                    </View>
                </Callout>
            </Marker>
        )
    }

    useEffect(() => {
        (async () => {
            const baseArea = await determineInitialAreaToDisplay();
            await fetchCamerasInArea(baseArea);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapview}
                userInterfaceStyle={"dark"}
                customMapStyle={DarkMapStyle}
                toolbarEnabled={false}
                mapType={"standard"}
                region={initialRegion === null ? null : {
                    latitude: initialRegion.latitude,
                    latitudeDelta: initialRegion.latitudeDelta,
                    longitude: initialRegion.longitude,
                    longitudeDelta: initialRegion.longitudeDelta,
                }}
                onTouchMove={() => setInitialRegion(null)}
                onRegionChangeComplete={handleOnRegionChangeComplete}
            >
                {cameras.map(renderCameraMarker)}
            </MapView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={loadingUserLocation}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Fetching your location</Text>
                        <ActivityIndicator />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#19232D",
    },
    mapview: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#19232D",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalText: {
        color: "white",
        marginRight: 10,
    },
    calloutContainer: {
        flexDirection: "column",
        alignSelf: "flex-start",
    },
    calloutText: {
        textAlign: "center",
    },
    bubble: {
        width: 140,
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: "lightblue",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: "lightblue",
        borderWidth: 0.5,
    },
    amount: {
        flex: 1,
    },
    arrow: {
        backgroundColor: "transparent",
        borderWidth: 16,
        borderColor: "transparent",
        borderTopColor: "lightblue",
        alignSelf: "center",
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: "transparent",
        borderWidth: 16,
        borderColor: "transparent",
        borderTopColor: "lightblue",
        alignSelf: "center",
        marginTop: -0.5,
    },
});

export default MapScreen;
