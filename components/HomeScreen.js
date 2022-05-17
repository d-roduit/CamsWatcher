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

    const fetchCameras = () => {
        if (myCamerasIds.size <= 0) return;
        setLoading(true);
        const getCamerasAPIEndpoint = `${API_BASE_URL}/list/webcam=${[...myCamerasIds].join(",")}/limit=50?show=webcams:image,location,player,statistics`;
        fetch(getCamerasAPIEndpoint, { headers: { "x-windy-key": API_KEY } })
            .then(response => response.json())
            .then(data => {
                setCameras(data.result.webcams.map(webcam => FormatHelper.removeCityFromTitle(webcam) || {}));
                setLoading(false);
            })
            .catch(err => console.error(err));
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
                            removeFromMyCameras(item.id);
                            resetCallback();
                        }}
                    />
                )}
            >
                <Avatar
                    icon={{ name: "camera", type: "ionicon", color: "gray" }}
                    size={item.image.sizes.icon.width}
                    source={{ uri: item.image.current.icon }}
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
