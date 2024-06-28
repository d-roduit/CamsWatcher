import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ListItem, Avatar, Divider, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FormatHelper from '../FormatHelper';
import { API_BASE_URL, API_KEY } from '@env';

function HomeScreen({ route, navigation }) {

    const [loading, setLoading] = useState(false);
    const [myCamerasIds, setMyCamerasIds] = useState(new Set());
    const [cameras, setCameras] = useState([]);

    const fetchMyCamerasIds = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('myCamerasIds');
            return (jsonValue === null) ? new Set() : new Set(JSON.parse(jsonValue));
        } catch (err) {
            console.error(err);
            return new Set();
        }
    }

    const fetchCameras = async () => {
        if (myCamerasIds.size <= 0) return;
        setLoading(true);
        const webcamDataToFetch = [
            "images",
            "location",
            "player",
        ];

        const nbMaxCamerasAllowedByAPIToFetchPerRequest = 25;

        const myCamerasIdsAsArray = [...myCamerasIds];
        const myCamerasIdsGroupedForFetching = [];
        while (myCamerasIdsAsArray.length > 0) {
            myCamerasIdsGroupedForFetching.push(myCamerasIdsAsArray.splice(0, nbMaxCamerasAllowedByAPIToFetchPerRequest));
        }

        try {
            const fetchRequests = [];

            for (const myCamerasIdsGroup of myCamerasIdsGroupedForFetching) {
                const getCamerasAPIEndpoint = `${API_BASE_URL}/webcams?webcamIds=${myCamerasIdsGroup.join(",")}&limit=${nbMaxCamerasAllowedByAPIToFetchPerRequest}&include=${webcamDataToFetch.join(",")}`;
                fetchRequests.push(
                    fetch(getCamerasAPIEndpoint, { headers: { "x-windy-api-key": API_KEY, "Content-Type": "application/json" } })
                );
            }

            const responses = await Promise.all(fetchRequests);
            const parseJSONResponsesPromises = responses.map(response => response.json());
            const arrayOfData = await Promise.all(parseJSONResponsesPromises);

            const webcams = arrayOfData.flatMap(data => data.webcams.map(webcam => FormatHelper.removeCityFromTitle(webcam) || {}));

            setCameras(webcams);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    }

    const removeFromMyCameras = async (cameraId) => {
        try {
            const myCamerasIdsCopy = new Set([...myCamerasIds]);
            myCamerasIdsCopy.delete(cameraId);
            const jsonValue = JSON.stringify([...myCamerasIdsCopy]);
            await AsyncStorage.setItem('myCamerasIds', jsonValue);
            setMyCamerasIds(myCamerasIdsCopy);
        } catch (err) {
            console.error(err);
        }
    }

    const renderListItemComponent = ({ item }) => {
        return (
            <ListItem.Swipeable
                containerStyle={styles.listItem}
                onPress={() => navigation.navigate("Camera", { camera: item })}
                rightContent={resetCallback => (
                    <Button
                        title="Remove"
                        icon={{
                            name: "remove",
                            type: "ionicon",
                            size: 18,
                            color: "white"
                        }}
                        buttonStyle={{ minHeight: '100%', backgroundColor: 'firebrick' }}
                        titleStyle={styles.whiteColor}
                        onPress={() => {
                            removeFromMyCameras(item.webcamId);
                            resetCallback();
                        }}
                    />
                )}
            >
                <Avatar
                    icon={{ name: "camera", type: "ionicon", color: "gray" }}
                    size={item.images.sizes.icon.width}
                    source={{ uri: item.images.current.icon }}
                    avatarStyle={styles.avatar}
                />

                <ListItem.Content>
                    <ListItem.Title style={styles.title}>
                        {item.title}
                    </ListItem.Title>

                    <ListItem.Subtitle style={styles.subtitle}>
                        {`${item.location.city} - ${item.location.country}`}
                    </ListItem.Subtitle>
                </ListItem.Content>

                <ListItem.Chevron />
            </ListItem.Swipeable>
        );
    }

    const renderItemSeparatorComponent = () => <Divider inset color={"dimgray"} />

    const renderHeaderComponent = () => {
        if (!loading) return null;

        return (
            <View style={styles.footerContainer}>
                <ActivityIndicator animating />
            </View>
        );
    };

    const areSetsEquals = (set1, set2) => {
        if (set1.size !== set2.size) return false;
        const arrayFromSet1 = [...set1];
        const arrayFromSet2 = [...set2];
        return arrayFromSet1.every((value, index) => value === arrayFromSet2[index]);
    }

    useEffect(() => {
        fetchCameras();
    }, [myCamerasIds]);

    useFocusEffect(
        useCallback(() => {
            let isScreenStillFocused = true;

            const updateCamerasListIfNeeded = async () => {
                const myCamerasIdsFromDB = await fetchMyCamerasIds();

                if (myCamerasIdsFromDB.size <= 0) {
                    setCameras([]);
                    return;
                }

                if (areSetsEquals(myCamerasIdsFromDB, myCamerasIds)) return;

                if (!isScreenStillFocused) return;

                setMyCamerasIds(myCamerasIdsFromDB);
            };

            updateCamerasListIfNeeded();

            return () => { isScreenStillFocused = false; };
        }, [myCamerasIds])
    );

    return (
        <View style={styles.container}>

            {
                cameras.length === 0 && (
                    <View style={styles.myCamerasEmptyContainer}>
                        <Ionicons name="camera" size={24} color="dimgray" />
                        <Text style={styles.myCamerasEmptyText}>No cameras yet</Text>
                        <Text style={styles.myCamerasEmptyText}>Saved cameras will appear here</Text>
                    </View>
                )
            }

            {
                cameras.length > 0 && (
                    <FlatList
                        data={cameras}
                        keyExtractor={(item, index) => index}
                        renderItem={renderListItemComponent}
                        ItemSeparatorComponent={renderItemSeparatorComponent}
                        indicatorStyle={"white"}
                        ListHeaderComponent={renderHeaderComponent}
                    />
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#19232D"
    },
    myCamerasEmptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    myCamerasEmptyText: {
        color: "dimgray",
        textAlign: "center",
    },
    listItem: {
        backgroundColor: "#19232D",
    },
    title: {
        color: "white",
    },
    subtitle: {
        color: "gray",
    },
    avatar: {
        borderRadius: 2,
    },
    footerContainer: {
        paddingVertical: 20,
    },
});

export default HomeScreen;
