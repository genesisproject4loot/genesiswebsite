import React from "react";

class GenesisManaMintForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        lootTokenId: '',
        inventoryId: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Loot Token Id:
          <input type="text" value={this.state.lootTokenId} onChange={this.handleChange} />
        </label>
        <label>
          Inventory Id:
          <input type="text" value={this.state.inventoryId} onChange={this.handleChange} />
        </label>

        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default GenesisManaMintForm;
