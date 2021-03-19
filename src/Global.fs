module Global

type Page =
    | Home
    | Counter

let toHash page =
    match page with
    | Counter -> "#counter"
    | Home -> "#home"
