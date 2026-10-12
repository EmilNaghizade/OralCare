// frontend/app/admin/QuizManagement.jsx
import 'react-native-gesture-handler';
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import QuizListScreen from "./components/QuizListScreen";
import QuizForm from "./components/QuizForm";
import QuestionsManagement from "./components/QuestionManegement";
import QuestionForm from "./components/QuestionForm";

const Stack = createStackNavigator();

export default function QuizManagement() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="QuizList"
        options={{
          headerShown: false,
        }}
        component={QuizListScreen}
      />
      <Stack.Screen
        name="AddQuiz"
        component={QuizForm}
        options={{
          headerShown: false,
        }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditQuiz"
        component={QuizForm}
        options={{
          headerShown: false,
        }}
        initialParams={{ isEditing: true }}
      />
      <Stack.Screen name="ManageQuestions" component={QuestionsManagement} />
      <Stack.Screen
        name="AddQuestion"
        component={QuestionForm}
        options={{
          headerShown: false,
        }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditQuestion"
        component={QuestionForm}
        options={{
          headerShown: false,
        }}
        initialParams={{ isEditing: true }}
      />
    </Stack.Navigator>
  );
}
