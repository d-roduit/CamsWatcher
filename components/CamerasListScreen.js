import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ListItem, Avatar, Divider } from '@rneui/themed';
import * as FormatHelper from '../FormatHelper';
import { API_BASE_URL, API_KEY } from '@env';

const fetchCamerasParams = {
    limit: 25,
    offset: 0
};

function CamerasListScreen({ navigation }) {

    const [loading, setLoading] = useState(false);
    const [nbTotalCameras, setNbTotalCameras] = useState(-1);
    const [cameras, setCameras] = useState([]);

    const fetchCameras = () => {
        setLoading(true);
        const webcamDataToFetch = [
            "image",
            "location",
            "player",
            "statistics",
        ];
        const getCamerasAPIEndpoint = `${API_BASE_URL}/list/orderby=random/limit=${fetchCamerasParams.limit},${fetchCamerasParams.offset}?show=webcams:${webcamDataToFetch.join(",")}`;
        fetch(getCamerasAPIEndpoint, { headers: { "x-windy-key": API_KEY, "Content-Type" : "application/json" } })
            .then(response => response.json())
            .then(data => {
                setNbTotalCameras(data.result.total);
                setCameras(previousState => [
                    ...previousState,
                    ...data.result.webcams.map(webcam => FormatHelper.removeCityFromTitle(webcam) || {})
                ]);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }

    const handleOnEndReached = () => {
        const newOffset = fetchCamerasParams.offset + fetchCamerasParams.limit;
        if (newOffset > nbTotalCameras - fetchCamerasParams.limit) return;
        fetchCamerasParams.offset = newOffset;
        fetchCameras();
    }

    const renderListItemComponent = ({ item }) => {
        return (
            <ListItem
                containerStyle={styles.listItem}
                onPress={() => navigation.navigate("Camera", { camera: item })}
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
            </ListItem>
        );
    }

    const renderItemSeparatorComponent = () => <Divider inset color={"dimgray"} />

    const renderFooterComponent = () => {
        if (!loading) return null;

        return (
            <View style={styles.footerContainer}>
                <ActivityIndicator animating />
            </View>
        );
    };

    useEffect(() => fetchCameras(), []);

    return (
        <View style={styles.container}>
            <FlatList
                data={cameras}
                keyExtractor={(item, index) => index}
                renderItem={renderListItemComponent}
                initialNumToRender={fetchCamerasParams.limit}
                ItemSeparatorComponent={renderItemSeparatorComponent}
                indicatorStyle={"white"}
                ListFooterComponent={renderFooterComponent}
                onEndReached={handleOnEndReached}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#19232D",
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

export default CamerasListScreen;
