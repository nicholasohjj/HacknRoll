import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { supabase } from "../../supabase/supabase";
import TransactionCard from "./transactionCard";
import { useNavigation } from "@react-navigation/native";
const transactions = require("../../db/transactions.json"); // For testing

const TransactionsList = () => {
  const [user, setUser] = useState(null);
  const [value, setValue] = useState("ongoing");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUser();
  }, []);

  const filteredTransactions = React.useMemo(() => {
    if (!user) return [];

    return transactions.filter((transaction) =>
      value === "ongoing"
        ? !transaction.status.completed &&
          (transaction.buyer_id === user.id ||
            transaction.queuer_id === user.id)
        : // Implement different logic for past transactions here
          transaction.status.completed &&
          (transaction.buyer_id === user.id ||
            transaction.queuer_id === user.id)
    );
  }, [user, value]);

  const renderTransactions = () => {
    return filteredTransactions.length > 0 ? (
      filteredTransactions.map((transaction) => (
        <View key={transaction.id}>
          <TransactionCard
            navigation={navigation}
            transaction={transaction}
            user={user}
          />
        </View>
      ))
    ) : (
      <Text style={styles.noTransactionsText}>No transactions available.</Text>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: "ongoing", label: "Ongoing" },
          { value: "past", label: "Past" },
        ]}
        style={styles.segmentedButtons}
      />
      <ScrollView>{renderTransactions()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  title: {
    paddingTop: 40,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    paddingBottom: 20,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  noTransactionsText: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default TransactionsList;
