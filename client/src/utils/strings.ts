export const Regex = {
    UpperCaseLettersRegex: /[A-Z]/,
    LowerCaseLettersRegex: /[a-z]/,
    NumbersRegex: /\d/,
    SpecialCharacterRegex: /[$&+,:;=?@#|<>.^*()%!_/\\"`~]/,
    // eslint-disable-next-line no-useless-escape
    LettersAndSpecialCharacterRegex: /^[A-Z @~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i,
    AllowedPasswordRegex:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$&+,:;=?@#|<>.^*()%!_/\\"`~])(?=.{10,}).*$/,
    ValidEmailRegex: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
    ValidURLRegex:
        /^((https?):\/\/.)[-a-zA-Z0-9@:%._\\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$/i,
};
