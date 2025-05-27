import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function TutorFilter() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [ratings, setRatings] = useState<number>();
    const [rate, setRate] = useState([0, 100]);

    const locationOption = [
        { label: 'Physical', value: 'Physical' },
        { label: 'Online', value: 'Online' },
        { label: 'Any', value: 'Any' }
    ]

    const ratingOption = [
        { label: 1.0, value: '1.0' },
        { label: 2.0, value: '2.0' },
        { label: 3.0, value: '3.0' },
        { label: 4.0, value: '4.0' },
        { label: 5.0, value: '5.0' },
    ]

    const handleClearing = () => {
        setLocation('')
        setRatings(-1)
        setRate([0, 100])
    }

    const handleFiltering = () => {
        router.push({
            pathname: '/tutor_find',
            params: {
                location: location,
                ratings: ratings,
                minRate: rate[0],
                maxRate: rate[1]
            }
        })
    }

    return (
        <View style={styles.container}>
            {/*Header*/}
            <View style={styles.background}/>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Ionicons name='arrow-back-circle' size={40} color='white' onPress={() => router.push('/tutor_find')} />
                <Text style={styles.headerText}>Filter</Text>
                <View style={{ width: 40 }}/>
            </View>

            <View style={{ justifyContent: 'flex-start', flexDirection: 'column', paddingTop: 20, paddingHorizontal: 10 }}>
                {/**Location */}
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={styles.title}>Location</Text>
                    <View style={styles.optionContainer}>
                        {locationOption.map((option) => (
                            <TouchableOpacity key={option.label} style={[styles.optionBox, location == option.value && styles.optionBoxSelected]} onPress={() => setLocation(option.label)}>
                                <Text style={[styles.optionText, location == option.value && styles.optionTextSelected]}>{option.value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/**Ratings */}
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={styles.title}>Ratings (Minimum)</Text>
                    <View style={styles.optionContainer}>
                        {ratingOption.map((star) => (
                            <TouchableOpacity key={star.label} style={[styles.optionBox, ratings == star.label && styles.optionBoxSelected]} onPress={() => setRatings(star.label)}>
                                <Text style={[styles.optionText, ratings == star.label && styles.optionTextSelected]}>{star.value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/**Hourly Rate */}
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={styles.title}>Hourly Rate (in SGD)</Text>
                    <MultiSlider
                        values={rate}
                        sliderLength={screenWidth * 0.8}
                        onValuesChange={setRate}
                        min={0}
                        max={100}
                        step={1}
                        selectedStyle={{ backgroundColor: 'orange' }}
                        unselectedStyle={{ backgroundColor: '#e0e0e0' }}
                        markerStyle={{
                            backgroundColor: 'orange',
                            height: 24,
                            width: 24,
                        }}
                    />

                    <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-between', width: screenWidth * 0.8}}>
                        <Text style={styles.rate}>Min: S${rate[0]}</Text>
                        <Text style={styles.rate}>Max: S${rate[1]}</Text>
                    </View>
                </View>

                {/**Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50}}>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearing}>
                        <Text style={styles.buttonText}>Clear all</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={handleFiltering}>
                        <Text style={styles.buttonText}>Apply</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20, justifyContent: 'flex-start' },
    background: {
        position: 'absolute',
        top: -550, 
        left: -150,
        width: 700,
        height: 650,
        borderRadius: 0,
        backgroundColor: '#ffc04d',
        zIndex: -1,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black'
    },
    title: {
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 5
    },
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        gap: 10,
        marginTop: 10,
    },
    optionBox: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#ccc',
    },
    optionBoxSelected: {
        backgroundColor: '#ffc04d',
        borderColor: '#ff9900',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'gray',
    },
    optionTextSelected: {
        color: 'white',
        fontWeight: '700',
    },
    rate: {
        fontSize: 16,
        fontWeight: '600'
    },
    applyButton: {
        backgroundColor: '#ffbf00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: 150
    },
    clearButton: {
        borderWidth: 2,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: 150
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black',
        textAlign: 'center'
    }
})