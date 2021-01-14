import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView} from 'react-native';
import { Header } from 'react-native-elements';
import AddingPasswordScreen from './AddingPasswordScreen';
import db from '../config';
import firebase from 'firebase';
import { Alert } from 'react-native';

export default class HomeScreen extends React.Component{
    constructor(){
        super();
        this.state = {allInfo: [],
                    userID: firebase.auth().currentUser.email,
                    lastVisibleInfo: "",
                    docID: ""}
    }

    getInfo=async()=>{
       console.log("getInfo")
        var dbref = await db.collection("info").where("emailID", "==", this.state.userID)
        .onSnapshot((snapshot)=>{
            var passwordList = snapshot.docs.map((doc)=>doc.data())
            this.setState({allInfo:passwordList})
            console.log(this.state.allInfo);
        })
    }

    /*getInfo=async()=>{
        const dbref = await db.collection("info").where("emailID", "==", this.state.userID).limit(3).get()
        dbref.docs.map((doc)=>{
            this.setState({
                allInfo:[...this.state.allInfo,doc.data()],
                lastVisibleInfo:doc
            })
        })
    }*/

    getMorePasswords=async()=>{
        const dbref = await db.collection("info").where("emailID", "==", this.state.userID).startAfter(this.state.lastVisibleInfo).limit(10).get()
        dbref.docs.map((doc)=>{
            this.setState({
                allInfo:[...this.state.allInfo,doc.data()],
                lastVisibleInfo:doc
            })
        })
    }

    deleteInfo=async(appName)=>{
        const query = await db.collection("info").where("appName","==",appName).where("emailID","==",this.state.userID).get()
        query.docs.map((doc)=>{
            var info = doc.data()
            db.collection("info").doc(doc.id).delete().then(function(){
                Alert.alert("Information deleted successfully")
            })
            console.log(doc.id);
        })
    }

    componentDidMount(){
        this.getInfo();
    }

    render(){
        return(
            <View>
            <View>
                <Header centerComponent = {{text: "Passwords", style:{color: 'blue', fontSize: 28, fontWeight: 'bold'}}}/>
            </View>
            <View style = {style.passwordAdd}>
                <TouchableOpacity onPress = {()=>{this.props.navigation.navigate('AddingPasswordScreen')}}>
                    <Text style = {{padding: 6, fontSize: 18}}>+Add Passwords</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress = {()=>{
                    this.props.navigation.navigate('StartingScreen')}}>
                    <Text style = {{padding: 6, fontSize: 18}}>Log Out</Text>
                </TouchableOpacity>
            </View>
            
                <ScrollView contentContainerStyle = {{paddingVertical:20, paddingBottom:130}}>
                    {this.state.allInfo.map((item)=>{
                        return(
                            <View style = {{marginTop: 2, borderTopWidth: 2, borderBottomWidth: 2}}>
                            <Text style = {{fontSize: 18}}>{"App Name: " + item.appName}</Text>
                            <Text style = {style.spacing}>{"Email for App/Website: " + item.emailForApp}</Text>
                            <Text style = {{fontSize: 18}}>{"Username: " + item.username}</Text>
                            <Text style = {style.spacing}>{"Password: " + item.password}</Text>
                            <TouchableOpacity style = {style.delete} onPress = {()=>{this.deleteInfo(item.appName)}}>
                                <Text style = {{padding: 6, fontSize: 18}}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                        )
                    })
                    }
                </ScrollView>

            </View>
        )
    }
}

const style = StyleSheet.create({
    passwordAdd:{
        backgroundColor:'cyan',
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 10,
        width: 230,
        height: 40
    },
    delete:{
        backgroundColor:'red',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 5,
        width: 170,
        height: 40
    },
    spacing:{
        marginTop: 1,
        backgroundColor: 'cyan',
        fontSize: 18
    }
})