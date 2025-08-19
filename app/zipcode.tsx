import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

export default function ZipcodeScreen() {
	const { session, user, updateProfile } = useAuth();
	const [zip, setZip] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!zip || zip.length < 5) {
			Alert.alert('Invalid Zip', 'Please enter a valid 5 digit zip code');
			return;
		}

		if (!session?.user) {
			Alert.alert('Error', 'No authenticated user');
			return;
		}

		setLoading(true);
		try {
			// If profile does not exist, create it using auth user id
			const { data: existing, error: fetchError } = await supabase
				.from('users')
				.select('*')
				.eq('id', session.user.id)
				.single();

			if (fetchError && fetchError.code !== 'PGRST116') {
				throw fetchError;
			}

			if (!existing) {
				const { error: insertError } = await supabase.from('users').insert({
					id: session.user.id,
					email: session.user.email,
					home_store_id: zip,
					notifications_enabled: true,
				});
				if (insertError) throw insertError;
			} else {
				const { error: updateErr } = await supabase
					.from('users')
					.update({ home_store_id: zip })
					.eq('id', session.user.id);
				if (updateErr) throw updateErr;
			}

			Alert.alert('Success', 'Zip code saved!');
		} catch (error: any) {
			Alert.alert('Error', error.message || 'Failed to save zip code');
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<View style={styles.content}>
				<Text style={styles.title}>Set Your Zip Code</Text>
				<Text style={styles.subtitle}>We'll use this to show inventory for nearby stores.</Text>
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="Zip Code"
						placeholderTextColor="#9BB3C2"
						keyboardType="numeric"
						value={zip}
						onChangeText={setZip}
					/>
					<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
						<Text style={styles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#012F47',
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 14,
		color: '#9BB3C2',
		textAlign: 'center',
		marginBottom: 30,
	},
	form: {
		width: '100%',
	},
	input: {
		backgroundColor: '#001A29',
		color: '#FFFFFF',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#FFFFFF',
	},
	button: {
		backgroundColor: '#780001',
		borderRadius: 8,
		padding: 15,
		alignItems: 'center',
		marginTop: 10,
	},
	buttonDisabled: {
		backgroundColor: '#ccc',
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
