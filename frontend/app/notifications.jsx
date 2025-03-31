import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar // For potential status bar styling
} from 'react-native';
import { Stack, useRouter } from 'expo-router'; // Import Stack for header options
import { Ionicons } from '@expo/vector-icons';
import Typo from '../components/Typo'; // Varsa Typo bileşeninizi ekleyin
import BackButton from "../components/BackButton"

// Örnek Bildirim Verileri (Backend olmadığında kullanılır)
const dummyNotifications = [
  { id: '1', title: 'Yeni makale yayınlandı: "Gelişmiş Teknikler..."', timestamp: '2s önce', read: false, icon: 'document-text-outline' },
  { id: '2', title: 'Quiz "Solunum Filtreleri" sonuçları hazır!', timestamp: '1g önce', read: false, icon: 'checkmark-circle-outline' },
  { id: '3', title: 'Video "Ağız Bakım Rehberi" İzle & Öğren\'e eklendi.', timestamp: '3g önce', read: true, icon: 'play-circle-outline' },
  { id: '4', title: 'Platforma hoş geldiniz!', timestamp: '1h önce', read: true, icon: 'sparkles-outline' },
  // Daha fazla örnek bildirim eklenebilir
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(dummyNotifications);

  // Bildirimi okundu olarak işaretleme (şimdilik sadece state günceller)
  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    // İleride buraya backend isteği eklenebilir
  };

  // Her bir bildirim satırını render eden fonksiyon
  const renderNotificationItem = ({ item }) => (
  
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => {
        console.log('Bildirime tıklandı:', item.id);
        markAsRead(item.id);
        // Burada ilgili içeriğe yönlendirme yapılabilir (örn: makale, quiz sonucu vb.)
        // router.push(`/articles/${item.relatedId}`); // Örnek yönlendirme
      }}
    >
      {/* Okunmadıysa sol başta nokta göster */}
      {!item.read && <View style={styles.unreadDot} />}


      <Ionicons
        name={item.icon || 'notifications-outline'} // İkon varsa onu, yoksa varsayılanı kullan
        size={28}
        color={!item.read ? "#038565" : "#555"} // Okunmadıysa farklı renk
        style={styles.notificationIcon}
      />
      <View style={styles.notificationTextContainer}>
        <Typo style={[styles.notificationTitle, !item.read && styles.unreadText]}>
          {item.title}
        </Typo>
        <Typo style={styles.notificationTimestamp}>{item.timestamp}</Typo>
      </View>
      <Ionicons
          name="chevron-forward-outline"
          size={18}
          color="#aaa"
          style={styles.chevronIcon}
        />
    </TouchableOpacity>
  );

  // Bildirim yoksa gösterilecek bileşen
  const renderEmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      <Typo style={styles.emptyText}>Henüz bildiriminiz yok.</Typo>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Expo Router'ın Stack'i ile başlığı ayarlama */}
      <BackButton/>
      <Stack.Screen
          options={{
              title: 'Bildirimler',
              headerShadowVisible: false, // İsteğe bağlı: Başlık altı çizgiyi kaldır
              headerTitleAlign: 'center', // Başlığı ortala
              // Geri butonu Expo Router tarafından otomatik eklenir
          }}
      />
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyListComponent}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Satırlar arasına çizgi ekle
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Arka plan rengi
  },
  listContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff', // Varsayılan arka plan
  },
  unreadItem: {
    backgroundColor: '#f0f8ff', // Okunmamış öğeler için hafif farklı arka plan (isteğe bağlı)
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#038565', // Okunmadı işaretçisi rengi
    marginRight: 10, // İkon ile arasında boşluk
    position: 'absolute', // Mutlak konumlandırma
    left: 15, // Soldan boşluk
    top: '50%', // Dikeyde ortala
    transform: [{ translateY: -4 }], // Tam ortalamak için yarım yükseklik kadar yukarı kaydır
  },
  notificationIcon: {
    marginRight: 15,
    marginLeft: 15, // Okunmadı noktası için yer aç
  },
  notificationTextContainer: {
    flex: 1, // Kalan tüm alanı kapla
    marginRight: 10, // Sağdaki chevron ikonu için boşluk
  },
  notificationTitle: {
    fontSize: 15,
    // fontWeight: 'normal', // Typo bileşeni kendi ağırlığını yönetebilir
    color: '#333',
    marginBottom: 3,
  },
  unreadText: {
    fontWeight: '600', // Okunmamış metni kalın yap (isteğe bağlı)
    color: '#000',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#888',
  },
  chevronIcon: {
     // Sağ taraftaki ikon için stil (şu an sadece renk var)
  },
  separator: {
    height: 1,
    backgroundColor: '#eee', // Ayırıcı çizgi rengi
    marginLeft: 65, // İkon ve noktanın solundan başlasın
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100, // Üstten biraz boşluk
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#aaa',
  },
});