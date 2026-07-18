import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from '@/rider/navigation/MainTabNavigator';
import { LocationSearchScreen } from '@/rider/screens/booking/LocationSearchScreen';
import { PickupSelectionScreen } from '@/rider/screens/booking/PickupSelectionScreen';
import { DestinationSelectionScreen } from '@/rider/screens/booking/DestinationSelectionScreen';
import { VehicleSelectionScreen } from '@/rider/screens/booking/VehicleSelectionScreen';
import { PaymentMethodScreen } from '@/rider/screens/booking/PaymentMethodScreen';
import { DriverSearchingScreen } from '@/rider/screens/tracking/DriverSearchingScreen';
import { DriverTrackingScreen } from '@/rider/screens/tracking/DriverTrackingScreen';
import { ActiveTripScreen } from '@/rider/screens/tracking/ActiveTripScreen';
import { TripCompletedScreen } from '@/rider/screens/tracking/TripCompletedScreen';
import { RatingScreen } from '@/rider/screens/tracking/RatingScreen';
import { TripReceiptScreen } from '@/rider/screens/tracking/TripReceiptScreen';
import { RideDetailsScreen } from '@/rider/screens/history/RideDetailsScreen';
import { EditProfileScreen } from '@/rider/screens/profile/EditProfileScreen';
import { SOSScreen } from '@/rider/screens/profile/SOSScreen';
import { EmergencyContactsScreen } from '@/rider/screens/profile/EmergencyContactsScreen';
import { SettingsScreen } from '@/rider/screens/settings/SettingsScreen';
import { ReferralScreen } from '@/rider/screens/settings/ReferralScreen';
import { NotificationsScreen } from '@/rider/screens/settings/NotificationsScreen';
import { SupportScreen } from '@/rider/screens/settings/SupportScreen';
import { ChatScreen } from '@/rider/screens/tracking/ChatScreen';
import { CancelRideScreen } from '@/rider/screens/booking/CancelRideScreen';
import { NoDriverScreen } from '@/rider/screens/booking/NoDriverScreen';
import { SavedPlacesScreen } from '@/rider/screens/booking/SavedPlacesScreen';
import { ScheduleRideScreen } from '@/rider/screens/booking/ScheduleRideScreen';
import { SurgeAlertScreen } from '@/rider/screens/booking/SurgeAlertScreen';
import { TermsScreen } from '@/rider/screens/system/TermsScreen';
import { ForceUpdateScreen } from '@/rider/screens/system/ForceUpdateScreen';
import { MaintenanceScreen } from '@/rider/screens/system/MaintenanceScreen';
import { NoCoverageScreen } from '@/rider/screens/system/NoCoverageScreen';
import type { RiderStackParamList } from '@/navigation/types';


const Stack = createNativeStackNavigator<RiderStackParamList>();

export function RiderNavigator() {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
      <Stack.Screen name="PickupSelection" component={PickupSelectionScreen} />
      <Stack.Screen name="DestinationSelection" component={DestinationSelectionScreen} />
      <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="DriverSearching" component={DriverSearchingScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="DriverTracking" component={DriverTrackingScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="TripCompleted" component={TripCompletedScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
      <Stack.Screen name="TripReceipt" component={TripReceiptScreen} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="CancelRide" component={CancelRideScreen} />
      <Stack.Screen name="NoDriver" component={NoDriverScreen} />
      <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
      <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
      <Stack.Screen name="SurgeAlert" component={SurgeAlertScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="ForceUpdate" component={ForceUpdateScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="NoCoverage" component={NoCoverageScreen} />
    </Stack.Navigator>
  );
}
