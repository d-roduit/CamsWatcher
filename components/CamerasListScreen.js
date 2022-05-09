import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ListItem, Avatar, Divider } from '@rneui/themed';
import { API_BASE_URL, API_KEY } from '@env';

const fetchCamerasRequestOptions = {
    limit: 50,
    offset: 0
};

function CamerasListScreen() {

    const [loading, setLoading] = useState(false);
    const [nbTotalCameras, setNbTotalCameras] = useState(-1);
    const [cameras, setCameras] = useState([]);

    const fetchCameras = () => {
        setLoading(true);
        const getCamerasAPIEndpoint = `${API_BASE_URL}/list/orderby=random/limit=${fetchCamerasRequestOptions.limit},${fetchCamerasRequestOptions.offset}?show=webcams:image,location`;
        fetch(getCamerasAPIEndpoint, { headers: { "x-windy-key": API_KEY } })
            .then(response => response.json())
            .then(data => {
                setNbTotalCameras(data.result.total);
                setCameras([
                    ...cameras,
                    ...data.result.webcams.map(webcam => {
                        if (webcam.title.length > webcam.location.city.length) {
                            webcam.title = webcam.title.substring(webcam.location.city.length + 2).trim();
                        }
                        return webcam;
                    })
                ]);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }

    const handleOnEndReached = () => {
        const newOffset = fetchCamerasRequestOptions.offset + fetchCamerasRequestOptions.limit;

        if (newOffset > nbTotalCameras - fetchCamerasRequestOptions.limit) return;

        fetchCamerasRequestOptions.offset = newOffset;

        fetchCameras();
    }

    const renderFooter = () => {
        if (!loading) return null;

        return (
            <View
                style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}
            >
                <ActivityIndicator animating size="large" />
            </View>
        );
    };

    useEffect(() => fetchCameras(), []);

    return (
        <View style={styles.container}>
            <FlatList
                ItemSeparatorComponent={() => <Divider inset color={"dimgray"} />}
                indicatorStyle={"white"}
                data={cameras}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ListItem
                        containerStyle={{backgroundColor: "black"}}
                    >
                        <Avatar
                            icon={{ name: "camera", type: "ionicon", color: "gray" }}
                            size={item.image.sizes.icon.width}
                            source={{ uri: item.image.current.icon }}
                            avatarStyle={{ borderRadius: 2 }}
                        />
                        <ListItem.Content>
                            <ListItem.Title style={{ color: 'white' }}>
                                {item.title}
                            </ListItem.Title>
                            <ListItem.Subtitle style={{ color: 'gray' }}>
                                {`${item.location.city} - ${item.location.country}`}
                            </ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                )}
                ListFooterComponent={renderFooter}
                onEndReached={handleOnEndReached}
                onEndReachedThreshold={20}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    }
});

export default CamerasListScreen;
