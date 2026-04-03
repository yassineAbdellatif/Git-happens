import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LocalizedNode } from "../../../services/floorPlanService";

type SearchResultsProps = {
  results: LocalizedNode[];
  onSelectNode: (node: LocalizedNode) => void;
};

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelectNode }) => {
  return (
    results.length > 0 && (
      <ScrollView style={styles.resultsContainer}>
        {results.map((node) => (
          <TouchableOpacity
            key={node.id}
            onPress={() => onSelectNode(node)}
            style={styles.resultItem}
          >
            <Text>{node.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 170,
  },
  resultItem: {
    padding: 10,
    marginLeft: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default SearchResults;