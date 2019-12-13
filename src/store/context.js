import React, { Component } from 'react';
export const LoginContext = React.createContext({
  isLogin: false,
  setLogin : ()=>{}
});