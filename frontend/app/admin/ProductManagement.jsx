
  // frontend/admin/ProductManagement.jsx
  import React, { useState, useEffect } from 'react';
  import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { createStackNavigator } from '@react-navigation/stack';
  import { useAuth } from '../_layout';
  import ProductForm from './components/ProductForm';
  
  const Stack = createStackNavigator();
  
  function ProductListScreen({ navigation }) {
    const { authToken } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // Fetch products from your API
      fetchProducts();
    }, []);
  
    const fetchProducts = async () => {
      try {
        // Replace with your actual API call
        // const response = await fetch('your-api-endpoint', {
        //   headers: { Authorization: `Bearer ${authToken}` }
        // });
        // const data = await response.json();
        
        // Dummy data for now
        const dummyData = [
          { id: '1', name: 'Electric Toothbrush', price: '89.99', category: 'Toothbrushes', inStock: true },
          { id: '2', name: 'Whitening Toothpaste', price: '12.99', category: 'Toothpastes', inStock: true },
          { id: '3', name: 'Dental Floss Pack', price: '5.99', category: 'Floss', inStock: false },
        ];
        
        setProducts(dummyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
  
    const handleDelete = (id) => {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this product?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                // Replace with your actual API call
                // await fetch(`your-api-endpoint/${id}`, {
                //   method: 'DELETE',
                //   headers: { Authorization: `Bearer ${authToken}` }
                // });
                
                // Update local state
                setProducts(products.filter(product => product.id !== id));
              } catch (error) {
                console.error('Error deleting product:', error);
              }
            } 
          },
        ]
      );
    };
  
    if (loading) {
      return (
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
                   <StatusBar barStyle="dark-content" />
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.buttonText}>Add New Product</Text>
        </TouchableOpacity>
        
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <View style={styles.productInfo}>
                  <View style={styles.thumbnailPlaceholder} />
                  <View style={styles.textContainer}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productCategory}>{item.category}</Text>
                      <Text style={[
                        styles.stockStatus, 
                        item.inStock ? styles.inStock : styles.outOfStock
                      ]}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                  >
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    );
  }
  
  export default function ProductManagement() {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="ProductList" 
          component={ProductListScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddProduct" 
          component={ProductForm}
          options={{ title: 'Add New Product' }}
          initialParams={{ isEditing: false }}
        />
        <Stack.Screen 
          name="EditProduct" 
          component={ProductForm}
          options={{ title: 'Edit Product' }}
          initialParams={{ isEditing: true }}
        />
      </Stack.Navigator>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#F2F2F7',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#8E8E93',
    },
    productItem: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    thumbnailPlaceholder: {
      width: 60,
      height: 60,
      backgroundColor: '#E5E5EA',
      borderRadius: 6,
    },
    textContainer: {
      marginLeft: 12,
      flex: 1,
    },
    productName: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    productDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    productCategory: {
      fontSize: 14,
      color: '#8E8E93',
    },
    stockStatus: {
      fontSize: 14,
      fontWeight: '500',
    },
    inStock: {
      color: '#34C759',
    },
    outOfStock: {
      color: '#FF3B30',
    },
    actions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 6,
      marginLeft: 8,
    },
  });