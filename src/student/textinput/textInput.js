import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, VrButton, StyleSheet, Text } from "react-360";
import Keyboard from "./keyboard";
import Scroll from "./scroll";

class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      end: this.props.rows - 1,
      displayArray: [`${props.defaultInput}|`],
      text: "",
      rows: this.props.rows || 4,
      columns: this.props.cols || 50,
      submitHandler: this.props.onSubmit || null,
      showScroll: false,
      toggleCursor: true,
      pages: 0,
      focus: false,
      counter: 0,
      opacity: 0,
      textColor: this.props.textColor || "white",
      backgroundColor: this.props.backgroundColor || "grey"
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      displayArray: [`${nextProps.defaultInput}|`]
    });
  }

  calculateAdd(s) {
    let index;
    const results = [];
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i] === " ") {
        index = i;
        if (s.slice(0, index + 1).length > this.state.columns + 1) {
          // 11 = cols + 1
          continue;
        } else {
          index = i;
          break;
        }
      }
    }
    if (index) {
      results[0] = s.slice(0, index + 1);
      results[1] = s.slice(index + 1);
    } else {
      results[0] = `${s.slice(0, s.length - 2)}-`;
      results[1] = s.slice(s.length - 2);
    }
    return results;
  }

  // ------------

  calculateDelete(s) {
    let index;
    const results = [];

    for (let i = 0; i < s.length; i++) {
      if (s[i] === " ") {
        index = i;
        break;
      }
    }

    if (index) {
      return [s.slice(0, index + 1), s.slice(index + 1)];
    }
    return [s, null];
  }

  // -------------

  findPosition(start, end) {
    let index;
    // find the string that has the cursor
    const arr = this.state.displayArray;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        if (arr[i].includes("|")) {
          index = i;
          break;
        }
      }
    }

    // check if the string with the cursor is in the window of start and end, if not move them in the correct direction till the string with the cursor shows up

    if (index > end) {
      var found = false;
      while (!found) {
        start++;
        end++;

        for (i = start; i <= end; i++) {
          if (arr[i].includes("|")) {
            found = true;
            break;
          }
        }
      }
    } else if (index < start) {
      found = false;
      while (!found) {
        start--;
        end--;

        for (i = start; i <= end; i++) {
          if (arr[i].includes("|")) {
            found = true;
            break;
          }
        }
      }
    }

    const results = [];
    results[0] = index;
    results[1] = start;
    results[2] = end;

    return results;
  }

  // ---------------

  focus() {
    this.setState({ focus: true });
  }

  // ---------------

  handleAllLetters(val) {
    if (val === "                                                         ") {
      val = " ";
    }
    let start = this.state.start;
    let end = this.state.end;
    const cols = this.state.columns;
    const arr = this.state.displayArray;

    let index;

    // get the current cursor position string, and move start and end accordingly

    let tempArray = this.findPosition(start, end);

    console.log("item ", tempArray);

    index = tempArray[0];
    start = tempArray[1];
    end = tempArray[2];

    // add the current character at position CP

    const cp = arr[index].indexOf("|");
    arr[index] = arr[index].slice(0, cp) + val + arr[index].slice(cp);
    console.log(arr);

    // if the current string has exceeded its length after adding a character ...

    if (arr[index].length > cols + 1) {
      // in a loop pass the values of the array to the calculate function to get back properly trimmed strings
      let done = false;
      while (!done) {
        // get back an array called list which will have the two parts that the string is split up in
        const list = this.calculateAdd(arr[index]);
        // add the first item of list to the array

        arr[index] = list[0];
        index++;

        // if there is a second item in list then append the next entry in the array to it and repeat the calculate function
        if (list[1]) {
          if (arr[index]) {
            var s = list[1] + arr[index];
            console.log("s ", s);
          } else {
            s = list[1];
            console.log("s in else ", s);
          }

          arr.splice(index, 0, s);
          tempArray = this.findPosition(start, end);
          index = tempArray[0];
          start = tempArray[1];
          end = tempArray[2];

          if (s.length <= cols + 1) {
            done = true;
          }
          console.log(`done is ${done} for ${s}`);
        }
      }
    }

    this.setState(
      {
        displayArray: arr,
        start,
        end
      },
      function() {
        console.log("new value of start ", this.state.start);
        console.log("new value of end ", this.state.end);
      }
    );
  }

  // ------------

  handleDelete() {
    console.log("this.state.displayArray");
    if (this.state.displayArray[0][0] !== "|") {
      let arr = this.state.displayArray;
      let start = this.state.start;
      let end = this.state.end;
      const cols = this.state.columns;
      let tempArray = this.findPosition(start, end);
      // console.log(tempArray);
      let index = tempArray[0];
      start = tempArray[1];
      end = tempArray[2];

      // find the appropriate string where the cursor is and move start and end accordingly
      // find the CP
      let cp = arr[index].indexOf("|");

      // if cp is the first character of the string, then move the cursor to the previous string
      if (cp === 0) {
        arr[index] = arr[index].slice(1);
        arr[index - 1] = `${arr[index - 1]}|`;
        cp = arr[index - 1].length - 1;
        index--;
        // see if the display window needs to be moved
        tempArray = this.findPosition(start, end);
        index = tempArray[0];
        start = tempArray[1];
        end = tempArray[2];
        // console.log(tempArray);
      }
      // delete the character at cp-1
      arr[index] = arr[index].slice(0, cp - 1) + arr[index].slice(cp);
      console.log(arr);
      // if the string with the cursor is lesser in length than cols + 1 then find the next string, append it etc. till all strings have moved correctly ...

      if (arr[index].length < cols + 1) {
        let done = false;
        while (!done) {
          // if the cursor is in the last string of the array, then there is nothing to do
          console.log("index, arr.length -1 ", index, arr.length - 1);
          if (!arr[index + 1]) {
            done = true;
            tempArray = this.findPosition(start, end);
            index = tempArray[0];
            start = tempArray[1];
            end = tempArray[2];
            // find the new window
            break;
          }

          // find the sub-word till after the first space in the string at index +1 and add it to string at index
          // console.log('next string ', arr[index + 1]);
          const list = this.calculateDelete(arr[index + 1]);
          // console.log('calculated list ', list);
          // if the length of this new string is = cols + 1 then index++ and find the new window - might not need this

          // if the length of this new string is > cols + 1 then index++ and find the new window
          if ((arr[index] + list[0]).length > cols + 1) {
            index++;
          } else {
            arr[index] = arr[index] + list[0];
            arr[index + 1] = list[1];
          }

          // console.log('arr in last line of while loop ', arr);
          // if the length of this new string is < cols + 1, then arr[index] becomes this new string. arr[index + 1]; arr[index + 1] becomes the truncated part of the string
        }
      }

      if (arr[arr.length - 1] === null) {
        arr = arr.slice(0, arr.length - 1);
      }

      this.setState({
        displayArray: arr,
        start,
        end
      });
    }
  }

  // ------

  handleBack() {
    if (this.state.displayArray[0][0] !== "|") {
      const arr = this.state.displayArray;
      let start = this.state.start;
      let end = this.state.end;
      const cols = this.state.columns;
      let index;

      let tempArray = this.findPosition(start, end);

      index = tempArray[0];
      start = tempArray[1];
      end = tempArray[2];

      const cp = arr[index].indexOf("|");

      if (cp === 0) {
        console.log("cp = 0 in handleBack");
        arr[index] = arr[index].slice(1);
        arr[index - 1] = `${arr[index - 1]}|`;
        tempArray = this.findPosition(start, end);
        index = tempArray[0];
        start = tempArray[1];
        end = tempArray[2];
      } else {
        arr[index] = `${arr[index].slice(0, cp - 1)}|${arr[index][cp - 1]}${arr[
          index
        ].slice(cp + 1)}`;
      }

      this.setState({
        displayArray: arr,
        start,
        end
      });
    }
  }

  // ------

  handleForward() {
    if (
      this.state.displayArray[this.state.displayArray.length - 1][
        this.state.displayArray[this.state.displayArray.length - 1].length - 1
      ] !== "|" &&
      this.state.displayArray[this.state.end + 1] !== ""
    ) {
      const arr = this.state.displayArray;
      let start = this.state.start;
      let end = this.state.end;
      const cols = this.state.columns;
      let index;

      let tempArray = this.findPosition(start, end);

      index = tempArray[0];
      start = tempArray[1];
      end = tempArray[2];

      const cp = arr[index].indexOf("|");

      if (cp === arr[index].length - 1) {
        console.log("cp = length - 1 in handleForward");
        arr[index] = arr[index].slice(0, arr[index].length - 1);
        arr[index + 1] = `|${arr[index + 1]}`;
        console.log("array[index] ", arr[index]);
        tempArray = this.findPosition(start, end);
        index = tempArray[0];
        start = tempArray[1];
        end = tempArray[2];
      } else {
        arr[index] = `${arr[index].slice(0, cp) + arr[index][cp + 1]}|${arr[
          index
        ].slice(cp + 2)}`;
      }

      this.setState({
        displayArray: arr,
        start,
        end
      });
    }
  }

  // ------

  handleSubmit() {
    const submitArray = this.state.displayArray;
    for (let i = 0; i < submitArray.length; i++) {
      submitArray[i] = submitArray[i]
        .split("")
        .filter(element => element !== "|")
        .join("");
    }
    this.setState({
      start: 0,
      end: this.props.rows - 1,
      displayArray: ["|"],
      text: "",
      submitHandler: this.props.onSubmit || null,
      showScroll: false,
      toggleCursor: true,
      pages: 0,
      focus: false,
      counter: 0,
      opacity: 0
    });
    this.props.onSubmit(submitArray.join(""));
  }

  // ------

  handleUp() {
    if (this.state.start !== 0) {
      this.setState({
        start: this.state.start - 1,
        end: this.state.end - 1
      });
    }
  }

  // ------

  handleDown() {
    if (this.state.end !== this.state.displayArray.length - 1) {
      this.setState({
        start: this.state.start + 1,
        end: this.state.end + 1
      });
    }
  }

  // ------

  showScroll() {
    let total = 0;
    for (let i = 0; i < this.state.displayArray.length; i++) {
      if (this.state.displayArray[i] != "") total++;
    }

    return total > this.state.rows ? 1 : this.state.opacity;
  }

  render() {
    const arr = this.state.displayArray;
    const start = this.state.start;
    const end = this.state.end;
    let displayString = "";

    for (let i = start; i <= end; i++) {
      if (arr[i]) {
        displayString += `${arr[i]}\n`;
      }
    }

    displayString = displayString.slice(0, displayString.length - 1);

    return (
      <View
        style={{
          transform: [
            { rotateY: this.props.rotateY || 0 },
            { rotateX: this.props.rotateX || 0 }
          ]
        }}
      >
        <Text
          style={{
            textAlign: "center"
          }}
        >
          Please enter your name below:
        </Text>
        <VrButton onClick={this.focus.bind(this)} style={{ margin: 40 }}>
          <Text
            style={{
              textAlign: "center",
              color: this.state.textColor,
              width: this.state.columns * 20,
              opacity: 0.8,
              margin: 10,
              fontSize: 16
            }}
          >
            {displayString}
          </Text>
        </VrButton>
        <Scroll
          opacity={this.showScroll.bind(this)()}
          handleUp={this.handleUp.bind(this)}
          handleDown={this.handleDown.bind(this)}
        />
        {this.state.focus ? (
          <Keyboard
            keyboardOnHover={this.props.keyboardOnHover}
            keyboardColor={this.props.keyboardColor}
            handleAllLetters={this.handleAllLetters.bind(this)}
            handleDelete={this.handleDelete.bind(this)}
            handleBack={this.handleBack.bind(this)}
            handleForward={this.handleForward.bind(this)}
            handleSubmit={this.handleSubmit.bind(this)}
          />
        ) : null}
      </View>
    );
  }
}

TextInput.propTypes = {
  defaultInput: PropTypes.string
};

TextInput.defaultProps = {
  defaultInput: ""
};

export default TextInput;
