import { View, Text, StyleSheet, Image, ViewProps } from 'react-native'
import React from 'react'

export type BookingProps = ViewProps & {
    profilePicture: string,
    studentName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Booking({
    profilePicture,
    studentName,
    course,
    slot,
    read
}: BookingProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Session Booked</Text>
                <Text style={styles.subtitle}>{studentName} has booked a session with you for {course} on {slot}</Text>
            </View>
        </View>
    )
}

export type AcceptedProps = ViewProps & {
    profilePicture: string,
    tutorName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Accepted({
    profilePicture,
    tutorName,
    course,
    slot,
    read
}: AcceptedProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Booking Accepted</Text>
                <Text style={styles.subtitle}>{tutorName} has accepted your booking for {course} on {slot}</Text>
            </View>
        </View>
    )
}

export type RejectedProps = ViewProps & {
    profilePicture: string,
    tutorName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Rejected({
    profilePicture,
    tutorName,
    course,
    slot,
    read
}: RejectedProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Booking Rejected</Text>
                <Text style={styles.subtitle}>Sorry, {tutorName} has rejected your booking for {course} on {slot}</Text>
            </View>
        </View>
    )
}

export type PaymentProps = ViewProps & {
    profilePicture: string,
    studentName: string,
    amount: number,
    course: string,
    slot: string,
    read: boolean
}

export function Payment({
    profilePicture,
    studentName,
    amount,
    course,
    slot,
    read
}: PaymentProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Payment Received for {course} ({slot})</Text>
                <Text style={styles.subtitle}>{studentName} has made a payment of S${amount} to you. Please kindly check.</Text>
            </View>
        </View>
    )
}

export type ConfirmedProps = ViewProps & {
    profilePicture: string,
    tutorName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Confirmed({
    profilePicture,
    tutorName,
    course,
    slot,
    read
}: ConfirmedProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Session Confirmed for {course} ({slot})</Text>
                <Text style={styles.subtitle}>{tutorName} has received your payment. Session get started!</Text>
            </View>
        </View>
    )
}

export type CompletedProps = ViewProps & {
    profilePicture: string,
    tutorName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Completed({
    profilePicture,
    tutorName,
    course,
    slot,
    read
}: CompletedProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Session Completed</Text>
                <Text style={styles.subtitle}>Congrats! Your {course} session taught by {tutorName} on {slot} has been completed!</Text>
                <Text style={styles.subtitle}>Please kindly submit feedback before booking for next session.</Text>
            </View>
        </View>
    )
}

export type ReviewProps = ViewProps & {
    profilePicture: string,
    studentName: string,
    course: string,
    slot: string,
    read: boolean
}

export function Review({
    profilePicture,
    studentName,
    course,
    slot,
    read
}: ReviewProps) {
    return (
        <View style={styles.container}>
            {read || <View style={styles.badge} />}
            <Image
            style={styles.avatar}
            source={{ uri: profilePicture }}
            />
            <View style={styles.notiContainer}>
                <Text style={styles.title}>Review Received for {course} ({slot})</Text>
                <Text style={styles.subtitle}>{studentName} has submitted a feedback to your tutoring. Please kindly check it under your profile.</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            paddingLeft: 10,
            paddingVertical: 10,
            borderBottomColor: "gray",
            borderBottomWidth: 1,
            height: 90
        },
        avatar: {
            width: 55,
            height: 55,
            borderRadius: 50,
            alignSelf: "center"
        },
        notiContainer: {
            flex: 1,
            justifyContent: "space-around",
            alignItems: "flex-start",
            marginLeft: 10
        },
        title: {
            fontSize: 18,
            fontWeight: "bold"
        },
        subtitle: {
            fontSize: 16,
            fontWeight: "semibold",
            color: "gray"
        },
        badge: {
            position: "absolute",
            top: 45,
            width: 8,
            height: 8,
            borderRadius: 20,
            backgroundColor: "red",
        }
    })