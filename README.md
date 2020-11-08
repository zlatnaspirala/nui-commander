
## [WIP] ##


# nui-commander #
 Motion detect on video stream is used to create and control UI Menu system with basic GUI controls, actions-events, popup or creating dom element or canvas staff.
 Interface must be drawn on video tag in `AR` manner.
 Objective is to create total manipulation only with your hands in the air.


![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/screenshot.jpg)

 DOM elements are on whole document size and indicate at the moment .
 On canvas indicator table blocks canvas object will accumulate movement action and after some little period on
 idle it ill fall to the opacity `0`. This is just example of usage!

### FEATURE DONE LIST

#### Individual command

#### Message Box NUI with two button options yes or no

```js
app.drawer.elements.push(
  new window.nuiMsgBox(
  "Do you love this project?",
  function (answer) {

    console.log(answer)
    app.drawer.removeElementByName("nuiMsgBox")

    if (answer == "yes") {

      console.log("Good answer is yes.")

      setTimeout( () => {
        app.drawer.elements.push(
        new window.nuiMsgBox(
          "Do you wanna to activate voice commander?",
          function (answer) {
            app.drawer.removeElementByName("nuiMsgBox")
            if (answer == "yes") {
              // root.vc.run()
              alert('ok')
            }
          }))
      }, 800)

    } else {
      console.log("Ok good buy.")
      window.location.href = "https://google.com"
    }
}))

```

### Objective:

   - web instance [priory]
       - must work on chrome, opera, safari, firefox and all mobile versions.
       - video stream basic movement motion detect
       - make small canvas object drawer and create interface and logic for actions(some method call)
       - must have a excellent input output logic to be reusable in many ways.


### nui-commander user in:

![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/nui-commander-vuletube.png)
#### Nui-commander used like submodules in
#### https://github.com/zlatnaspirala/vue-typescript-starter


### LICENCE:

  Based on project:
  https://github.com/soundstep/magic-xylophone
  MIT

