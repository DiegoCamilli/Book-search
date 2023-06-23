const { User, Book } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                // .populate('books')
                return userData
            }
            throw new AuthenticationError('Not logged in')
        }
    },

    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email})
            if(!user) {
                throw new AuthenticationError('Incorrect credentials')
            }
            const correctPw = await user.isCorrectPassword(password)
            if(!correctPw) {
                throw new AuthenticationError('Something went wrong. Try again.')
            }
            const token = signToken(user)
            return {token, user}
        },

        addUser: async (parent, args) => {  
            console.log("we are here")
            const user = await User.create(args)
            const token = signToken(user)
            console.log(token)
            return {token, user}
        },

        saveBook: async (parent, {input}, context) => {
            if(context.user) {
                console.log(input)
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: input}},
                    {new: true}
                )
                return updatedUser
            }
            throw new AuthenticationError('Uh Oh, you need to be logged in.')
        },

        removeBook: async (parent, {bookId}, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId: bookId}}},
                    {new: true}
                )
                return updatedUser
            }
            throw new AuthenticationError('Uh Oh, you need to be logged in.')
        }
    }
}

module.exports = resolvers