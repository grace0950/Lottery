import React, { Component } from "react";
import Lottery from "./contracts/Lottery.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {
    owner: "",
    players: [],
    winner: "",
    balance: "",
    value: "",
    message: "",
    web3: null,
    accounts: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Lottery.networks[networkId];
      const instance = new web3.eth.Contract(
        Lottery.abi,
        deployedNetwork && deployedNetwork.address,
      );
      this.setState({ web3: web3, accounts: accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    const owner = await this.state.contract.methods.owner().call();
    const players = await this.state.contract.methods.getPlayers().call();
    const balance = await this.state.web3.eth.getBalance(this.state.contract.options.address);
    this.setState({ owner: owner, players: players, balance: balance });

  };

  onSubmit = async () => {
    const { accounts, contract, web3 } = this.state;
    this.setState({ message: "交易進行中..." });
    await contract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether")
    });
    this.setState({ message: "您已下注成功！" });
  };

  onClick = async () => {
    const { accounts, contract } = this.state;
    this.setState({ message: "交易進行中..." });
    await contract.methods.pickWinner().send({
      from: accounts[0]
    });

    const winner = await contract.methods.getWinner().call();
    this.setState({ message: "中獎人已選出！", winner: winner });
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h2>樂透</h2>
        <p>發起人：{this.state.owner}</p>
        <p>目前人數：{this.state.players.length}</p>
        <p>獎金：{this.state.web3.utils.fromWei(this.state.balance, "ether")} ether</p>
        <p>中獎人：{this.state.winner}</p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>試試你的運氣吧!</h4>
          <div>
            <label>你的賭注</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />{" "}
            ether
          </div>
          <button type="submit" >下注</button>
        </form>
        <hr />
        <h4>準備好要開獎了嗎？</h4>
        <button onClick={this.onClick}>
          選出中獎人
        </button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
