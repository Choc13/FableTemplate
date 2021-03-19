module Home.State

open Elmish
open Types

let init () : Model * Cmd<Msg> =
  "", []

let update msg _ : Model * Cmd<Msg> =
    match msg with
    | ChangeStr str ->
        str, []
